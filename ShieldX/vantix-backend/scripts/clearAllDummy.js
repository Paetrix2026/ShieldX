require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Violation = require('../models/Violation');
const ActivityLog = require('../models/ActivityLog');

async function clearAllDummy() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Clear] Connected to MongoDB');

    // 1. Delete all violations
    const v = await Violation.deleteMany({});
    console.log(`[Clear] Deleted ${v.deletedCount} Violations`);

    // 2. Delete all activity logs
    const a = await ActivityLog.deleteMany({});
    console.log(`[Clear] Deleted ${a.deletedCount} Activity Logs`);

    // 3. Delete all employees
    const u = await User.deleteMany({ role: 'employee' });
    console.log(`[Clear] Deleted ${u.deletedCount} Employees`);

    console.log('[Clear] All dummy data wiped!');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearAllDummy();
