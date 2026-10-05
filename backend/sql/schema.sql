CREATE DATABASE IF NOT EXISTS nassautickets CHARACTER SET utf8mb4;
USE nassautickets;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  login VARCHAR(50) NOT NULL UNIQUE,
  senha_hash VARCHAR(100) NOT NULL,
  perfil ENUM('ATENDENTE','GESTOR') NOT NULL DEFAULT 'ATENDENTE'
);

-- Linha única usada como trava (lock) para serializar emissão e chamada
CREATE TABLE IF NOT EXISTS controle_fila (
  id TINYINT PRIMARY KEY,
  proxima_sp BOOLEAN NOT NULL DEFAULT TRUE
);
INSERT IGNORE INTO controle_fila (id, proxima_sp) VALUES (1, TRUE);

CREATE TABLE IF NOT EXISTS senhas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(14) NOT NULL UNIQUE,         -- YYMMDD-PPSQ
  tipo ENUM('SP','SE','SG') NOT NULL,
  seq SMALLINT NOT NULL,
  data DATE NOT NULL,
  estado ENUM('EMITIDA','AGUARDANDO','CHAMADA','CHAMADA_NOVAMENTE',
              'EM_ATENDIMENTO','ATENDIDA','NAO_COMPARECEU') NOT NULL,
  motivo VARCHAR(40) NULL,                    -- ex.: DESCARTADA_FIM_EXPEDIENTE
  guiche TINYINT NULL,
  usuario_id INT NULL,
  emitida_em DATETIME NOT NULL,
  primeira_chamada DATETIME NULL,
  segunda_chamada DATETIME NULL,
  inicio_atendimento DATETIME NULL,
  fim_atendimento DATETIME NULL,
  UNIQUE KEY uq_tipo_seq_dia (data, tipo, seq),
  INDEX idx_fila (data, tipo, estado, seq),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
