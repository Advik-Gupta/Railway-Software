package routes

import (
	"github.com/go-chi/chi/v5"

	"backend/internal/controllers"
)

func mountAuthRoutes(r chi.Router, auth *controllers.AuthController) {
	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/signup", auth.Signup)
		r.Post("/login", auth.Login)
	})
}