-- name: CreateMachine :one
INSERT INTO machines (name, machine_type, assigned_engineer_id, created_by)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListMachines :many
SELECT
    m.*,
    COUNT(DISTINCT ts.id) AS test_site_count,
    u.full_name AS assigned_engineer_name
FROM machines m
LEFT JOIN test_sites ts ON ts.machine_id = m.id
LEFT JOIN users u ON u.id = m.assigned_engineer_id
GROUP BY m.id, u.full_name
ORDER BY m.created_at DESC;

-- name: GetMachine :one
SELECT * FROM machines WHERE id = $1;

-- name: DeleteMachine :exec
DELETE FROM machines WHERE id = $1;

-- name: UpdateMachineEngineer :one
UPDATE machines SET assigned_engineer_id = $2
WHERE id = $1
RETURNING *;