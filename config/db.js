require("dotenv").config();
const { MongoClient } = require("mongodb");

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.n063kih.mongodb.net/blood_donation_db?retryWrites=true&w=majority`;

const client = new MongoClient(MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB Connected Successfully");
    return client.db();
  } catch (error) {
    console.error("Database Connection Failed:", error);
    throw error;
  }
}

module.exports = { connectDB };
