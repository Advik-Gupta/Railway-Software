package main

import (
	"context"
	"log"
	"net/http"

	_ "backend/docs"
	"backend/internal/config"
	"backend/internal/controllers"
	"backend/internal/database"
	"backend/internal/db/sqlcgen"
	"backend/internal/routes"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()
	pool, err := database.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("could not connect to database: %v", err)
	}
	defer pool.Close()

	queries := sqlcgen.New(pool)

	router := routes.SetupRouter(routes.Controllers{
		Auth:      controllers.NewAuthController(queries, cfg.JWTSecret),
		Machine:   controllers.NewMachineController(queries, pool),
		TestSite:  controllers.NewTestSiteController(queries),
		Point:     controllers.NewPointController(queries),
		User:      controllers.NewUserController(queries),
		JWTSecret: cfg.JWTSecret,
	})

	log.Println("listening on :" + cfg.Port)
	log.Println("swagger docs at http://localhost:" + cfg.Port + "/docs/index.html")
	log.Fatal(http.ListenAndServe(":"+cfg.Port, router))
}