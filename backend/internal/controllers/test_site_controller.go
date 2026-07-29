package controllers

import (
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"

	"backend/internal/db/sqlcgen"
)

type TestSiteController struct {
	Queries *sqlcgen.Queries
}

func NewTestSiteController(q *sqlcgen.Queries) *TestSiteController {
	return &TestSiteController{Queries: q}
}

func (t *TestSiteController) ListByMachine(w http.ResponseWriter, r *http.Request) {
	machineID, err := parseUUIDParam(r, "machineId")
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid machine id")
		return
	}

	sites, err := t.Queries.ListTestSitesByMachine(r.Context(), machineID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list test sites")
		return
	}

	writeJSON(w, http.StatusOK, sites)
}

func (t *TestSiteController) Get(w http.ResponseWriter, r *http.Request) {
	id, err := parseUUIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid test site id")
		return
	}

	site, err := t.Queries.GetTestSite(r.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "test site not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not fetch test site")
		return
	}

	writeJSON(w, http.StatusOK, site)
}