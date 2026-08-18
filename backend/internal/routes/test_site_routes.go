package routes

import (
	"github.com/go-chi/chi/v5"

	"backend/internal/controllers"
)

func mountTestSiteRoutes(r chi.Router, testSite *controllers.TestSiteController, point *controllers.PointController) {
	r.Get("/api/v1/test-sites/{id}", testSite.Get)
	r.Get("/api/v1/test-sites/{testSiteId}/points", point.ListByTestSite)
}