package routes

import (
	"github.com/go-chi/chi/v5"

	"backend/internal/controllers"
	appmiddleware "backend/internal/middleware"
)

func mountSeedRoutes(r chi.Router, seed *controllers.SeedController) {
	r.With(appmiddleware.RequireRole("admin")).Get("/api/v1/seed/dev", seed.Run)
}