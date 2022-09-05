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

app.get("/latest/:number", async (req, res) => {
  const number = req.params.number;
  try {
    const dbres = await client.query('select * from pastes order by time desc limit $1', [number]);
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
