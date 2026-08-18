package routes

import (
	"github.com/go-chi/chi/v5"

	"backend/internal/controllers"
	appmiddleware "backend/internal/middleware"
)

func mountMachineRoutes(r chi.Router, machine *controllers.MachineController, testSite *controllers.TestSiteController) {
	r.Route("/api/v1/machines", func(r chi.Router) {
		r.With(appmiddleware.RequireRole("admin")).Post("/", machine.Create)
		r.Get("/", machine.List)
		r.Get("/{id}", machine.Get)
		r.With(appmiddleware.RequireRole("admin")).Delete("/{id}", machine.Delete)
		r.With(appmiddleware.RequireRole("admin")).Patch("/{id}/engineer", machine.AssignEngineer)

		r.Get("/{machineId}/test-sites", testSite.ListByMachine)
	})
}