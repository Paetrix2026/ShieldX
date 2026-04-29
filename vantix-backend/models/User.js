const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
    orgId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: function() { return this.role === 'employee'; } 
    },
    accessStatus: {
      type: String,
      enum: ["granted", "revoked"],
      default: "granted",
    },
    lastSeenAt: {
      type: Date,
    },
    lastSeenPlatform: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
