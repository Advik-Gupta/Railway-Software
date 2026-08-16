-- name: CreateMachine :one
INSERT INTO machines (name, machine_type, assigned_engineer_id, created_by)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListMachines :many
SELECT
    m.*,
    COUNT(ts.id) AS test_site_count
FROM machines m
LEFT JOIN test_sites ts ON ts.machine_id = m.id
GROUP BY m.id
ORDER BY m.created_at DESC;

-- name: GetMachine :one
SELECT * FROM machines WHERE id = $1;

-- name: DeleteMachine :exec
DELETE FROM machines WHERE id = $1;