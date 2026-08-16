package controllers

import (
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"

	"backend/internal/db/sqlcgen"
)

type UserController struct {
	Queries *sqlcgen.Queries
}

func NewUserController(q *sqlcgen.Queries) *UserController {
	return &UserController{Queries: q}
}

func (u *UserController) List(w http.ResponseWriter, r *http.Request) {
	users, err := u.Queries.ListUsers(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list users")
		return
	}
	writeJSON(w, http.StatusOK, users)
}

func (u *UserController) Get(w http.ResponseWriter, r *http.Request) {
	id, err := parseUUIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	user, err := u.Queries.GetUserByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "user not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not fetch user")
		return
	}

	writeJSON(w, http.StatusOK, user)
}