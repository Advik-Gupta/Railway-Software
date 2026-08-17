-- +goose Up
ALTER TABLE machines
    DROP CONSTRAINT machines_assigned_engineer_id_fkey,
    ADD CONSTRAINT machines_assigned_engineer_id_fkey
        FOREIGN KEY (assigned_engineer_id) REFERENCES users(id) ON DELETE SET NULL;

-- +goose Down
ALTER TABLE machines
    DROP CONSTRAINT machines_assigned_engineer_id_fkey,
    ADD CONSTRAINT machines_assigned_engineer_id_fkey
        FOREIGN KEY (assigned_engineer_id) REFERENCES users(id);