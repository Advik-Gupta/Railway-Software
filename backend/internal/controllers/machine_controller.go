package controllers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"backend/internal/db/sqlcgen"
	"backend/internal/middleware"
	"backend/internal/services"
)

type MachineController struct {
	Queries *sqlcgen.Queries
	Pool    *pgxpool.Pool
}

func NewMachineController(q *sqlcgen.Queries, pool *pgxpool.Pool) *MachineController {
	return &MachineController{Queries: q, Pool: pool}
}

type createMachineRequest struct {
	MachineType        string                 `json:"machineType"`
	MachineName        string                 `json:"machineName"`
	AssignedEngineerID string                 `json:"assignedEngineerId"`
	TestSiteCount      int                    `json:"testSiteCount"`
	StartingNumber     int                    `json:"startingNumber"`
	TestSiteDetails    testSiteDetailsRequest `json:"testSiteDetails"`
}

type testSiteDetailsRequest struct {
	Division              string  `json:"division"`
	CurveType             string  `json:"curveType"`
	CurveNumber           string  `json:"curveNumber"`
	DegreeOfCurve         string  `json:"degreeOfCurve"`
	Section               string  `json:"section"`
	Station               string  `json:"station"`
	Line                  string  `json:"line"`
	KmFrom                float64 `json:"kmFrom"`
	KmTo                  float64 `json:"kmTo"`
	GmtYear               float64 `json:"gmtYear"`
	NextGrindingDueDate   string  `json:"nextGrindingDueDate"`
	NextRepaintingDueDate string  `json:"nextRepaintingDueDate"`
}

// Create builds a machine plus every generated test site and point in one
// transaction. created_by always comes from the authenticated user's JWT
// (set by middleware.RequireAuth) — never trusted from the request body.
func (m *MachineController) Create(w http.ResponseWriter, r *http.Request) {
	var req createMachineRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.MachineType == "" || req.MachineName == "" || req.TestSiteCount < 1 {
		writeError(w, http.StatusBadRequest, "machineType, machineName, and at least one test site are required")
		return
	}
	if _, ok := services.MachineTypePoints[req.MachineType]; !ok {
		writeError(w, http.StatusBadRequest, "unrecognized machine type")
		return
	}

	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "could not identify current user")
		return
	}

	result, err := services.CreateMachineWithTestSites(r.Context(), m.Pool, services.CreateMachineInput{
		MachineType:        req.MachineType,
		MachineName:        req.MachineName,
		AssignedEngineerID: req.AssignedEngineerID,
		TestSiteCount:      req.TestSiteCount,
		StartingNumber:     req.StartingNumber,
		CreatedBy:          userID,
		TestSiteDetails: services.TestSiteDetailsInput{
			Division:              req.TestSiteDetails.Division,
			CurveType:             req.TestSiteDetails.CurveType,
			CurveNumber:           req.TestSiteDetails.CurveNumber,
			DegreeOfCurve:         req.TestSiteDetails.DegreeOfCurve,
			Section:               req.TestSiteDetails.Section,
			Station:               req.TestSiteDetails.Station,
			Line:                  req.TestSiteDetails.Line,
			KmFrom:                req.TestSiteDetails.KmFrom,
			KmTo:                  req.TestSiteDetails.KmTo,
			GmtYear:               req.TestSiteDetails.GmtYear,
			NextGrindingDueDate:   req.TestSiteDetails.NextGrindingDueDate,
			NextRepaintingDueDate: req.TestSiteDetails.NextRepaintingDueDate,
		},
	})
	if err != nil {
		log.Printf("create machine failed: %v", err)
		writeError(w, http.StatusInternalServerError, "could not create machine")
		return
	}

	writeJSON(w, http.StatusCreated, result)
}

func (m *MachineController) List(w http.ResponseWriter, r *http.Request) {
	machines, err := m.Queries.ListMachines(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list machines")
		return
	}
	writeJSON(w, http.StatusOK, machines)
}

func (m *MachineController) Get(w http.ResponseWriter, r *http.Request) {
	id, err := parseUUIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid machine id")
		return
	}

	machine, err := m.Queries.GetMachine(r.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "machine not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not fetch machine")
		return
	}

	testSites, err := m.Queries.ListTestSitesByMachine(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not fetch test sites")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"machine":   machine,
		"testSites": testSites,
	})
}

func (m *MachineController) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseUUIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid machine id")
		return
	}

	if err := m.Queries.DeleteMachine(r.Context(), id); err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete machine")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// parseUUIDParam is shared by every controller with an :id-style route param.
func parseUUIDParam(r *http.Request, name string) (pgtype.UUID, error) {
	var id pgtype.UUID
	err := id.Scan(chi.URLParam(r, name))
	return id, err
}