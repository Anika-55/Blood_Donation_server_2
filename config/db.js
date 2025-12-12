require("dotenv").config();
const { MongoClient } = require("mongodb");

const { DB_USER, DB_PASSWORD } = process.env;

if (!DB_USER || !DB_PASSWORD) {
  throw new Error("DB_USER or DB_PASSWORD not defined in .env");
}

const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.n063kih.mongodb.net/blood_donation_db?retryWrites=true&w=majority`;

const client = new MongoClient(MONGO_URI);

let dbInstance;

async function connectDB() {
  if (dbInstance) return dbInstance; // reuse existing connection

  try {
    await client.connect();
    console.log("MongoDB Connected Successfully");
    dbInstance = client.db("blood_donation_db");
    return dbInstance;
  } catch (error) {
    console.error("Database Connection Failed:", error);
    throw error; // important: rethrow so registerUser can catch
  }
}

module.exports = { connectDB };
