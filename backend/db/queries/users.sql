-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: CreateUser :one
INSERT INTO users (email, password_hash, full_name, role)
VALUES ($1, $2, $3, $4)
RETURNING id, email, full_name, role, created_at;

-- name: ListUsers :many
SELECT id, email, full_name, role, created_at FROM users ORDER BY full_name;

-- name: GetUserByID :one
SELECT id, email, full_name, role, created_at FROM users WHERE id = $1;