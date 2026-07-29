-- name: CreatePoint :one
INSERT INTO points (test_site_id, point_name)
VALUES ($1, $2)
RETURNING *;

-- name: ListPointsByTestSite :many
SELECT * FROM points WHERE test_site_id = $1 ORDER BY point_name;