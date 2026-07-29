-- name: CreateMachine :one
INSERT INTO machines (name, machine_type, assigned_engineer_id, created_by)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListMachines :many
SELECT * FROM machines ORDER BY created_at DESC;

-- name: GetMachine :one
SELECT * FROM machines WHERE id = $1;

-- name: DeleteMachine :exec
DELETE FROM machines WHERE id = $1;