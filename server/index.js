const keys = require("./keys");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const redis = require("redis");
const port = 5000;

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  connectionLimit: 10,
  host: keys.mqHost,
  user: keys.mqUser,
  password: keys.mqPassword,
  database: keys.mqDatabase,
});

pool.on("error", () => console.log("Lost mysql connection"));

pool.on("connection", (client) => {
  client.query(
    "CREATE TABLE IF NOT EXISTS svalues (number INT);",
    (err, res, fields) => {
      if (err) throw err;

      console.log("created svalues table");
    }
  );
});

// setup redis client
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

redisClient.on("error", (err) => {
  console.error(err);
});

const redisPublisher = redisClient.duplicate();

// express route handlers

app.get("/values/all", async (req, res) => {
  const values = pool.query("SELECT * from svalues", (err, results, fields) => {
    if (err) {
      return res.status(422).json(err);
    }
    return res.json(results);
  });
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    res.json(values);
  });
});

app.post("/values", async (req, res) => {
  const { index } = req.body;

  if (parseInt(index) > 40) {
    return res.status(422).json("Index too high");
  }
  redisClient.hset("values", index, "Nothing yet");
  redisPublisher.publish("insert", index);
  pool.query(
    "INSERT into `svalues`(number) VALUES (?)",
    [index],
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(422).json(err);
      }

      return res.json({ working: true });
    }
  );
});

app.listen(port, (err) => {
  console.log("Listening");
});
