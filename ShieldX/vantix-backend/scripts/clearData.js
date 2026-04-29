require('dotenv').config();
const mongoose = require('mongoose');
const Violation = require('../models/Violation');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

async function clearData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Clear] Connected to MongoDB');

    // 1. Delete all violations
    const v = await Violation.deleteMany({});
    console.log(`[Clear] Deleted ${v.deletedCount} Violations`);

    // 2. Delete all activity logs
    const a = await ActivityLog.deleteMany({});
    console.log(`[Clear] Deleted ${a.deletedCount} Activity Logs`);

    // 3. Delete dummy employees
    const u = await User.deleteMany({ role: 'employee', email: /@nexustech\.com$/ });
    console.log(`[Clear] Deleted ${u.deletedCount} Dummy Employees`);

    console.log('[Clear] Done!');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearData();
