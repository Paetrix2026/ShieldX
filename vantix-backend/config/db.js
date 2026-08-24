// ─── Vantix — Database Connection ────────────────────────────────────────────
// Connects to MongoDB using Mongoose.
// Reads MONGO_URI from .env (set via dotenv in server.js before this runs).
//
// Call connectDB() once at server startup.
// Mongoose automatically handles reconnection after that.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("[DB] MONGO_URI is not set in .env — aborting");
    process.exit(1);
  }



  try {
    await mongoose.connect(uri, {});
    console.log(`[DB] MongoDB connected ✓`);

    mongoose.connection.on("disconnected", () => {
      console.warn("[DB] MongoDB disconnected — Mongoose will auto-reconnect");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("[DB] MongoDB reconnected ✓");
    });

  } catch (err) {
    console.error("[DB] Connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
