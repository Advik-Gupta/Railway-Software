package routes

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"

	"backend/internal/controllers"
	appmiddleware "backend/internal/middleware"
)

type Controllers struct {
	Auth      *controllers.AuthController
	Machine   *controllers.MachineController
	TestSite  *controllers.TestSiteController
	Point     *controllers.PointController
	JWTSecret string
}

func SetupRouter(c Controllers) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("ok")) })
	r.Get("/ping", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("pong")) })

	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/signup", c.Auth.Signup)
		r.Post("/login", c.Auth.Login)
	})

	r.Group(func(r chi.Router) {
		r.Use(appmiddleware.RequireAuth(c.JWTSecret))

		r.Route("/api/v1/machines", func(r chi.Router) {
			r.With(appmiddleware.RequireRole("admin")).Post("/", c.Machine.Create)
			r.Get("/", c.Machine.List)
			r.Get("/{id}", c.Machine.Get)
			r.With(appmiddleware.RequireRole("admin")).Delete("/{id}", c.Machine.Delete)

			r.Get("/{machineId}/test-sites", c.TestSite.ListByMachine)
		})

		r.Get("/api/v1/test-sites/{id}", c.TestSite.Get)
		r.Get("/api/v1/test-sites/{testSiteId}/points", c.Point.ListByTestSite)
	})

	r.Get("/docs/*", httpSwagger.WrapHandler)

	return r
}