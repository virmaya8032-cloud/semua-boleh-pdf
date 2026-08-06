-- Skema pangkalan data untuk "Semua Boleh PDF"
-- PostgreSQL (Neon)

CREATE TABLE IF NOT EXISTS pengguna (
  id            SERIAL PRIMARY KEY,
  nama          VARCHAR(100) NOT NULL,
  emel          VARCHAR(255) NOT NULL UNIQUE,
  kata_laluan   VARCHAR(255) NOT NULL,          -- hash bcrypt
  peranan       VARCHAR(20)  NOT NULL DEFAULT 'pengguna', -- 'pengguna' | 'pentadbir'
  aktif         BOOLEAN      NOT NULL DEFAULT TRUE,
  dicipta_pada  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Rekod penggunaan. Kandungan dokumen TIDAK disimpan; hanya metadata.
CREATE TABLE IF NOT EXISTS penggunaan (
  id            SERIAL PRIMARY KEY,
  pengguna_id   INTEGER REFERENCES pengguna(id) ON DELETE SET NULL,
  alat          VARCHAR(60)  NOT NULL,          -- slug alat, cth 'gabung-pdf'
  nama_alat     VARCHAR(120) NOT NULL,          -- nama paparan Bahasa Melayu
  saiz_bait     BIGINT       NOT NULL DEFAULT 0,
  status        VARCHAR(20)  NOT NULL DEFAULT 'berjaya', -- 'berjaya' | 'gagal'
  mesej         TEXT,
  dicipta_pada  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_penggunaan_pengguna ON penggunaan(pengguna_id);
CREATE INDEX IF NOT EXISTS idx_penggunaan_alat ON penggunaan(alat);
CREATE INDEX IF NOT EXISTS idx_penggunaan_tarikh ON penggunaan(dicipta_pada);
CREATE INDEX IF NOT EXISTS idx_pengguna_emel ON pengguna(emel);
