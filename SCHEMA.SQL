DROP TABLE IF EXISTS pastes;
CREATE TABLE pastes(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  paste VARCHAR(1000) NOT NULL,
  time timestamp without time zone DEFAULT now()
 );
INSERT INTO pastes(paste) VALUES ('test paste');