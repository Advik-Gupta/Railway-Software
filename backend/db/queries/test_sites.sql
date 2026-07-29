-- name: CreateTestSite :one
INSERT INTO test_sites (
    machine_id, test_site_number, division, curve_type, curve_number,
    degree_of_curve, section, station, line, km_from, km_to, annual_gmt,
    establishment_date, next_grinding_due_date, next_repainting_due_date, created_by
) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
RETURNING *;

-- name: ListTestSitesByMachine :many
SELECT * FROM test_sites WHERE machine_id = $1 ORDER BY test_site_number;

-- name: GetTestSite :one
SELECT * FROM test_sites WHERE id = $1;