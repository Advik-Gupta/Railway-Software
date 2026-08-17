package seed

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"backend/internal/db/sqlcgen"
	"backend/internal/services"
	"backend/internal/utils"
)

type Result struct {
	OperatorsCreated int `json:"operatorsCreated"`
	MachinesCreated  int `json:"machinesCreated"`
	TestSitesCreated int `json:"testSitesCreated"`
	PointsCreated    int `json:"pointsCreated"`
}

// Run wipes existing operators and all machine/test-site data, then
// recreates everything from data.go inside one transaction. createdBy is
// the currently authenticated admin's id — every seeded machine/test site
// is attributed to whoever actually ran the seed, not a fake system user.
func Run(ctx context.Context, pool *pgxpool.Pool, createdByStr string) (*Result, error) {
	createdBy, err := uuidFromString(createdByStr)
	if err != nil {
		return nil, fmt.Errorf("invalid createdBy id: %w", err)
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	q := sqlcgen.New(tx)

	// --- Operators: delete and recreate ---
	if err := q.DeleteOperators(ctx); err != nil {
		return nil, fmt.Errorf("delete existing operators: %w", err)
	}

	hashedPassword, err := utils.HashPassword(SeedOperatorPassword)
	if err != nil {
		return nil, fmt.Errorf("hash seed password: %w", err)
	}

	operatorsCreated := 0
	for _, op := range Operators {
		_, err := q.CreateUser(ctx, sqlcgen.CreateUserParams{
			Email:        op.Email,
			PasswordHash: hashedPassword,
			FullName:     op.FullName,
			Role:         "operator",
		})
		if err != nil {
			return nil, fmt.Errorf("create operator %s: %w", op.Email, err)
		}
		operatorsCreated++
	}

	// --- Machines, test sites, points ---
	machinesCreated := 0
	testSitesCreated := 0
	pointsCreated := 0

	for _, m := range Machines {
		pointsPerSite, ok := services.MachineTypePoints[m.MachineType]
		if !ok {
			return nil, fmt.Errorf("unknown machine type in seed data: %s", m.MachineType)
		}

		machine, err := q.CreateMachine(ctx, sqlcgen.CreateMachineParams{
			Name:               m.Name,
			MachineType:        m.MachineType,
			AssignedEngineerID: pgtype.UUID{}, // unassigned at seed time
			CreatedBy:          createdBy,
		})
		if err != nil {
			return nil, fmt.Errorf("create machine %s: %w", m.Name, err)
		}
		machinesCreated++

		for _, ts := range m.TestSites {
			site, err := q.CreateTestSite(ctx, sqlcgen.CreateTestSiteParams{
				MachineID:             machine.ID,
				TestSiteNumber:        ts.TestSiteNumber,
				Division:              textOrNull(ts.Division),
				CurveType:             textOrNull(ts.CurveType),
				CurveNumber:           textOrNull(ts.CurveNumber),
				DegreeOfCurve:         textOrNull(ts.DegreeOfCurve),
				Section:               textOrNull(ts.Section),
				Station:               textOrNull(ts.Station),
				Line:                  textOrNull(ts.Line),
				KmFrom:                numericFromFloat(ts.KmFrom),
				KmTo:                  numericFromFloat(ts.KmTo),
				AnnualGmt:             numericFromFloat(ts.GmtYear),
				EstablishmentDate:     pgtype.Date{},
				NextGrindingDueDate:   dateFromString(ts.NextGrindingDueDate),
				NextRepaintingDueDate: dateFromString(ts.NextRepaintingDueDate),
				CreatedBy:             createdBy,
			})
			if err != nil {
				return nil, fmt.Errorf("create test site %s: %w", ts.TestSiteNumber, err)
			}
			testSitesCreated++

			for p := 1; p <= pointsPerSite; p++ {
				pointName := fmt.Sprintf("%s.%d", ts.TestSiteNumber, p)
				_, err := q.CreatePoint(ctx, sqlcgen.CreatePointParams{
					TestSiteID: site.ID,
					PointName:  pointName,
				})
				if err != nil {
					return nil, fmt.Errorf("create point %s: %w", pointName, err)
				}
				pointsCreated++
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit transaction: %w", err)
	}

	return &Result{
		OperatorsCreated: operatorsCreated,
		MachinesCreated:  machinesCreated,
		TestSitesCreated: testSitesCreated,
		PointsCreated:    pointsCreated,
	}, nil
}