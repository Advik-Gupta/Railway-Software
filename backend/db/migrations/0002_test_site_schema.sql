-- +goose Up

-- Extend existing users table (created in 0001) rather than recreating it —
-- password_hash and full_name are already wired into auth_controller.go.
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR;

CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    machine_type VARCHAR NOT NULL,
    assigned_engineer_id UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Many-to-many: which engineers/operators have access to which machines
-- (this is the "Manage Access" grid from the create/edit user pages).
CREATE TABLE machine_engineers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    engineer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (machine_id, engineer_id)
);

CREATE TABLE test_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    test_site_number VARCHAR NOT NULL,
    division VARCHAR,
    curve_type VARCHAR,
    curve_number VARCHAR,
    degree_of_curve VARCHAR,
    section VARCHAR,
    station VARCHAR,
    line VARCHAR,
    km_from DECIMAL,
    km_to DECIMAL,
    annual_gmt DECIMAL,
    establishment_date DATE,
    next_grinding_due_date DATE,
    next_repainting_due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES users(id)
);

CREATE TABLE points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_site_id UUID NOT NULL REFERENCES test_sites(id) ON DELETE CASCADE,
    point_name VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE grind_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    point_id UUID NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    cycle_number INT NOT NULL,
    grind_date DATE,
    previous_gmt DECIMAL,
    current_gmt DECIMAL,
    next_due_date DATE,
    top_view TEXT[],
    dpt TEXT[],
    contact_band TEXT[],
    gauge_view TEXT[],
    longitudinal_view TEXT[],
    star_gauge TEXT[],
    miniprof_w_files TEXT[],
    miniprof_ban_files TEXT[],
    surface_hardness DECIMAL,
    surface_roughness DECIMAL,
    remarks TEXT,
    missing TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (point_id, cycle_number)
);

CREATE TABLE grind_pre_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grind_cycle_id UUID NOT NULL REFERENCES grind_cycles(id) ON DELETE CASCADE,
    image_url VARCHAR,
    measurement JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE grind_post_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grind_cycle_id UUID NOT NULL REFERENCES grind_cycles(id) ON DELETE CASCADE,
    image_url VARCHAR,
    measurement JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE repaint_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    point_id UUID NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    cycle_number INT NOT NULL,
    repaint_date DATE,
    next_due_date DATE,
    top_view TEXT[],
    dpt TEXT[],
    contact_band TEXT[],
    gauge_view TEXT[],
    longitudinal_view TEXT[],
    star_gauge TEXT[],
    miniprof_w_files TEXT[],
    miniprof_ban_files TEXT[],
    surface_hardness DECIMAL,
    surface_roughness DECIMAL,
    remarks TEXT,
    missing TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (point_id, cycle_number)
);

CREATE TABLE repaint_pre_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repaint_cycle_id UUID NOT NULL REFERENCES repaint_cycles(id) ON DELETE CASCADE,
    image_url VARCHAR,
    measurement JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE repaint_post_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repaint_cycle_id UUID NOT NULL REFERENCES repaint_cycles(id) ON DELETE CASCADE,
    image_url VARCHAR,
    measurement JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes for the exact queries your Test Site Tracker page needs
CREATE INDEX idx_test_sites_machine_id ON test_sites(machine_id);
CREATE INDEX idx_points_test_site_id ON points(test_site_id);
CREATE INDEX idx_grind_cycles_point_id ON grind_cycles(point_id);
CREATE INDEX idx_repaint_cycles_point_id ON repaint_cycles(point_id);
CREATE INDEX idx_test_sites_grinding_due ON test_sites(next_grinding_due_date);
CREATE INDEX idx_test_sites_repainting_due ON test_sites(next_repainting_due_date);

-- +goose Down
DROP TABLE IF EXISTS repaint_post_data;
DROP TABLE IF EXISTS repaint_pre_data;
DROP TABLE IF EXISTS repaint_cycles;
DROP TABLE IF EXISTS grind_post_data;
DROP TABLE IF EXISTS grind_pre_data;
DROP TABLE IF EXISTS grind_cycles;
DROP TABLE IF EXISTS points;
DROP TABLE IF EXISTS test_sites;
DROP TABLE IF EXISTS machine_engineers;
DROP TABLE IF EXISTS machines;
ALTER TABLE users DROP COLUMN IF EXISTS phone_number;