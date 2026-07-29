package services

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"backend/internal/db/sqlcgen"
)

var MachineTypePoints = map[string]int{
	"RGI96":    6,
	"SRGM":     8,
	"LRG":      2,
	"FM":       2,
	"CMRL_VRA": 6,
}

type TestSiteDetailsInput struct {
	Division              string
	CurveType             string
	CurveNumber           string
	DegreeOfCurve         string
	Section               string
	Station               string
	Line                  string
	KmFrom                float64
	KmTo                  float64
	GmtYear               float64
	NextGrindingDueDate   string
	NextRepaintingDueDate string
}

type CreateMachineInput struct {
	MachineType        string
	MachineName        string
	AssignedEngineerID string
	TestSiteCount      int
	StartingNumber     int
	CreatedBy          string
	TestSiteDetails    TestSiteDetailsInput
}

type TestSiteWithPoints struct {
	TestSite sqlcgen.TestSite `json:"testSite"`
	Points   []sqlcgen.Point  `json:"points"`
}

type CreateMachineResult struct {
	Machine   sqlcgen.Machine      `json:"machine"`
	TestSites []TestSiteWithPoints `json:"testSites"`
}

func CreateMachineWithTestSites(ctx context.Context, pool *pgxpool.Pool, input CreateMachineInput) (*CreateMachineResult, error) {
	pointsPerSite, ok := MachineTypePoints[input.MachineType]
	if !ok {
		return nil, fmt.Errorf("unknown machine type: %s", input.MachineType)
	}
	if input.TestSiteCount < 1 {
		return nil, fmt.Errorf("test site count must be at least 1")
	}

	createdBy, err := uuidFromString(input.CreatedBy)
	if err != nil {
		return nil, fmt.Errorf("invalid created_by id: %w", err)
	}

	var assignedEngineerID pgtype.UUID
	if input.AssignedEngineerID != "" {
		assignedEngineerID, err = uuidFromString(input.AssignedEngineerID)
		if err != nil {
			return nil, fmt.Errorf("invalid assigned_engineer_id: %w", err)
		}
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	q := sqlcgen.New(tx)

	machine, err := q.CreateMachine(ctx, sqlcgen.CreateMachineParams{
		Name:               input.MachineName,
		MachineType:        input.MachineType,
		AssignedEngineerID: assignedEngineerID,
		CreatedBy:          createdBy,
	})
	if err != nil {
		return nil, fmt.Errorf("create machine: %w", err)
	}

	details := input.TestSiteDetails
	testSites := make([]TestSiteWithPoints, 0, input.TestSiteCount)

	for i := 0; i < input.TestSiteCount; i++ {
		siteNumber := fmt.Sprintf("T%d", input.StartingNumber+i)

		ts, err := q.CreateTestSite(ctx, sqlcgen.CreateTestSiteParams{
			MachineID:             machine.ID,
			TestSiteNumber:        siteNumber,
			Division:              textOrNull(details.Division),
			CurveType:             textOrNull(details.CurveType),
			CurveNumber:           textOrNull(details.CurveNumber),
			DegreeOfCurve:         textOrNull(details.DegreeOfCurve),
			Section:               textOrNull(details.Section),
			Station:               textOrNull(details.Station),
			Line:                  textOrNull(details.Line),
			KmFrom:                numericFromFloat(details.KmFrom),
			KmTo:                  numericFromFloat(details.KmTo),
			AnnualGmt:             numericFromFloat(details.GmtYear),
			EstablishmentDate:     pgtype.Date{},
			NextGrindingDueDate:   dateFromString(details.NextGrindingDueDate),
			NextRepaintingDueDate: dateFromString(details.NextRepaintingDueDate),
			CreatedBy:             createdBy,
		})
		if err != nil {
			return nil, fmt.Errorf("create test site %s: %w", siteNumber, err)
		}

		points := make([]sqlcgen.Point, 0, pointsPerSite)
		for p := 1; p <= pointsPerSite; p++ {
			pointName := fmt.Sprintf("%s.%d", siteNumber, p)
			point, err := q.CreatePoint(ctx, sqlcgen.CreatePointParams{
				TestSiteID: ts.ID,
				PointName:  pointName,
			})
			if err != nil {
				return nil, fmt.Errorf("create point %s: %w", pointName, err)
			}
			points = append(points, point)
		}

		testSites = append(testSites, TestSiteWithPoints{TestSite: ts, Points: points})
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit transaction: %w", err)
	}

	return &CreateMachineResult{Machine: machine, TestSites: testSites}, nil
}