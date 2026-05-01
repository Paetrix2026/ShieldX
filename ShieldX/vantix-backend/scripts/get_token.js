require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ role: "admin" });
  if (user) {
    const token = jwt.sign(
      { id: user._id, role: user.role, orgId: user.orgId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log(token);
  } else {
    console.log("No admin found");
  }
  process.exit();
}
run();
