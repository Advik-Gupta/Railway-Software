-- name: CreateUser :one
INSERT INTO users (email, password_hash, full_name, role)
VALUES ($1, $2, $3, $4)
RETURNING id, email, full_name, role, created_at;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1;