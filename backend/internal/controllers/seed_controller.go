package controllers

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"

	"backend/internal/middleware"
	"backend/internal/seed"
)

type SeedController struct {
	Pool *pgxpool.Pool
}

func NewSeedController(pool *pgxpool.Pool) *SeedController {
	return &SeedController{Pool: pool}
}

// Run seeds the database with fresh operators + machines + test sites.
//
// ⚠️ Dev-only tool. This is destructive (wipes existing operators) and is
// gated by RequireRole("admin") at the route level, but there is no
// additional environment check here — do not deploy this route to a
// production environment without adding one (e.g. refuse unless
// os.Getenv("ENV") != "production").
func (s *SeedController) Run(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "could not identify current user")
		return
	}

	result, err := seed.Run(r.Context(), s.Pool, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "seeding failed: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, result)
}