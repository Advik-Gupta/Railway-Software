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
	User      *controllers.UserController
	Seed      *controllers.SeedController
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

	mountAuthRoutes(r, c.Auth)

	r.Group(func(r chi.Router) {
		r.Use(appmiddleware.RequireAuth(c.JWTSecret))

		mountSeedRoutes(r, c.Seed)
		mountMachineRoutes(r, c.Machine, c.TestSite)
		mountTestSiteRoutes(r, c.TestSite, c.Point)
		mountUserRoutes(r, c.User)
	})

	r.Get("/docs/*", httpSwagger.WrapHandler)

	return r
}