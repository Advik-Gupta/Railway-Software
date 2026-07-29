package services

import (
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func textOrNull(s string) pgtype.Text {
	if s == "" {
		return pgtype.Text{}
	}
	return pgtype.Text{String: s, Valid: true}
}

func numericFromFloat(f float64) pgtype.Numeric {
	var n pgtype.Numeric
	if f == 0 {
		return n
	}
	_ = n.Scan(f)
	return n
}

func dateFromString(s string) pgtype.Date {
	if s == "" {
		return pgtype.Date{}
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return pgtype.Date{}
	}
	return pgtype.Date{Time: t, Valid: true}
}

func uuidFromString(s string) (pgtype.UUID, error) {
	var u pgtype.UUID
	if s == "" {
		return u, nil
	}
	err := u.Scan(s)
	return u, err
}