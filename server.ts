import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
// const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const sslSetting = herokuSSLSetting;
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};
console.log(sslSetting)
const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/", async (req, res) => {
  // res.json({message: "success"})
  try {
    const dbres = await client.query('select * from pastes');
    res.json(dbres.rows);
  } catch (error) {
    console.error(error);
  }
});

app.post("/pastes/", async (req, res) => {
  try {
    const {title, paste} = req.body
    const dbres = await client.query('insert into pastes (title, paste) values ($1, $2) returning *', [title, paste])
    res.json(dbres.rows);
  } catch (error) {
    console.error(error);
    res.send(error)
  }
})

app.get("/pastes/:pasteId", async (req, res) => {
  const pasteId = req.params.pasteId;
  try {
    const dbres = await client.query('select * from pastes where id=$1', [pasteId]);
    res.json(dbres.rows[0]); // TODO ensure 1 single row of results
  } catch (error) {
    console.error(error);
  }
});

app.get("/pastes/latest/:number", async (req, res) => {
  const number = req.params.number;
  try {
    const dbres = await client.query('select * from pastes order by time desc limit $1', [number]);
    res.json(dbres.rows);
  } catch (error) {
    console.error(error);
  }
});

// delete paste
app.delete("/pastes/:pasteId", async (req, res) => {
  const pasteId = req.params.pasteId;
  try {
    await client.query('DELETE FROM comments WHERE paste_id = $1', [pasteId]);
    const dbres = await client.query('DELETE FROM  pastes WHERE id = $1 RETURNING *', [pasteId]);
    res.json(dbres.rows);
  } catch (error) {
    console.error(error);
  }
});

// edit paste
app.put("/pastes/:pasteId", async (req, res) => {
  const pasteId = req.params.pasteId;
  const {title, paste} = req.body;
  try {
    const dbres = await client.query("UPDATE pastes SET title=$1, paste=$2 WHERE id=$3 RETURNING *", [title, paste, pasteId]);
    res.json(dbres.rows);
  } catch (error) {
    console.error(error);
  }
})

// create comment
app.post("/pastes/:pasteId/comments", async (req, res) => {
  const pasteId = req.params.pasteId;
  const { message } = req.body;
  try {
    const dbres = await client.query("INSERT INTO comments(message, paste_id) VALUES($1, $2) RETURNING *", [message, pasteId]);
    res.json(dbres.rows);
  } catch (error) {
    console.error(error);
  }
});

// get all comments
app.get("/pastes/:pasteId/comments", async (req, res) => {
  const pasteId = req.params.pasteId;
  try {
    const dbres = await client.query('SELECT * FROM comments WHERE paste_id=$1', [pasteId]);
    res.json(dbres.rows);
  } catch (error) {
    console.error(error);
  }
});

// delete comment
app.delete("/pastes/comments/:commentId", async (req, res) => {
  const commentId = req.params.commentId;
  try {
    const dbres = await client.query('DELETE FROM comments WHERE id = $1 RETURNING *', [commentId]);
    res.json(dbres.rows);
  } catch (error) {
    console.error(error);
  }
});


//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
