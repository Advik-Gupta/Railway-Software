package controllers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"backend/internal/db/sqlcgen"
	"backend/internal/utils"
)

type UserController struct {
	Queries *sqlcgen.Queries
}

type updateUserRequest struct {
	FullName    string `json:"full_name"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	PhoneNumber string `json:"phone_number"`
}

type resetPasswordRequest struct {
	NewPassword string `json:"newPassword"`
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

func (u *UserController) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseUUIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	if err := u.Queries.DeleteUser(r.Context(), id); err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete user")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (u *UserController) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseUUIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	var req updateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.FullName == "" || req.Email == "" || req.Role == "" {
		writeError(w, http.StatusBadRequest, "full_name, email, and role are required")
		return
	}

	user, err := u.Queries.UpdateUser(r.Context(), sqlcgen.UpdateUserParams{
		ID:          id,
		FullName:    req.FullName,
		Email:       req.Email,
		Role:        req.Role,
		PhoneNumber: textOrNull(req.PhoneNumber),
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			writeError(w, http.StatusConflict, "an account with that email already exists")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not update user")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func (u *UserController) ResetPassword(w http.ResponseWriter, r *http.Request) {
	id, err := parseUUIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	var req resetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.NewPassword) < 8 {
		writeError(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	hash, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not process password")
		return
	}

	if err := u.Queries.UpdateUserPassword(r.Context(), sqlcgen.UpdateUserPasswordParams{
		ID:           id,
		PasswordHash: hash,
	}); err != nil {
		writeError(w, http.StatusInternalServerError, "could not reset password")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (u *UserController) ListAssignedMachines(w http.ResponseWriter, r *http.Request) {
	id, err := parseUUIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	machines, err := u.Queries.ListMachinesByEngineer(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list assigned machines")
		return
	}
	if machines == nil {
		machines = []sqlcgen.Machine{}
	}

	writeJSON(w, http.StatusOK, machines)
}