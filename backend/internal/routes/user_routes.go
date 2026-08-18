package routes

import (
	"github.com/go-chi/chi/v5"

	"backend/internal/controllers"
	appmiddleware "backend/internal/middleware"
)

func mountUserRoutes(r chi.Router, user *controllers.UserController) {
	r.Route("/api/v1/users", func(r chi.Router) {
		r.With(appmiddleware.RequireRole("admin")).Get("/", user.List)
		r.Get("/{id}", user.Get)
		r.With(appmiddleware.RequireRole("admin")).Put("/{id}", user.Update)
		r.With(appmiddleware.RequireRole("admin")).Delete("/{id}", user.Delete)
		r.With(appmiddleware.RequireRole("admin")).Patch("/{id}/password", user.ResetPassword)
		r.Get("/{id}/machines", user.ListAssignedMachines)
	})
}