-- Migration: 0001_contacts
-- Run with: npx wrangler d1 execute tradesquote-contacts --file=migrations/0001_contacts.sql

CREATE TABLE IF NOT EXISTS contacts (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  name        TEXT     NOT NULL,
  email       TEXT     NOT NULL,
  phone       TEXT,
  message     TEXT     NOT NULL,
  ip_address  TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);