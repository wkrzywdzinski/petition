DROP TABLE IF EXISTS petition;
CREATE TABLE petition (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  lastname VARCHAR(200) NOT NULL,
  signature TEXT
);
SELECT * FROM petition;
