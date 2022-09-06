DROP TABLE IF EXISTS pastes;
DROP TABLE IF EXISTS comments;

CREATE TABLE pastes(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  paste VARCHAR(1000) NOT NULL,
  time timestamp without time zone DEFAULT now()
 );
INSERT INTO pastes(paste) VALUES ('test paste');

CREATE TABLE comments(
  id SERIAL PRIMARY KEY,
  message VARCHAR(255),
  paste_id INTEGER REFERENCES pastes(id),
  time timestamp without time zone DEFAULT now()
);

INSERT INTO comments(message, paste_id) VALUES('a test comment for paste, hello!', 1)




