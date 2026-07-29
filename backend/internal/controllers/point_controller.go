package controllers

import (
	"net/http"

	"backend/internal/db/sqlcgen"
)

type PointController struct {
	Queries *sqlcgen.Queries
}

func NewPointController(q *sqlcgen.Queries) *PointController {
	return &PointController{Queries: q}
}

func (p *PointController) ListByTestSite(w http.ResponseWriter, r *http.Request) {
	testSiteID, err := parseUUIDParam(r, "testSiteId")
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid test site id")
		return
	}

	points, err := p.Queries.ListPointsByTestSite(r.Context(), testSiteID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list points")
		return
	}

	writeJSON(w, http.StatusOK, points)
}