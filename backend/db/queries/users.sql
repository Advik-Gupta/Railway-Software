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

-- name: DeleteOperators :exec
DELETE FROM users WHERE role = 'operator';

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- name: UpdateUser :one
UPDATE users
SET full_name = $2, email = $3, role = $4, phone_number = $5
WHERE id = $1
RETURNING id, email, full_name, role, phone_number, created_at;

-- name: UpdateUserPassword :exec
UPDATE users SET password_hash = $2 WHERE id = $1;

-- name: ListMachinesByEngineer :many
SELECT * FROM machines WHERE assigned_engineer_id = $1 ORDER BY name;