require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Violation = require('../models/Violation');
const ActivityLog = require('../models/ActivityLog');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const users = await User.find({ role: 'employee' });
    console.log(`[Check] Found ${users.length} employee(s):`, users.map(u => u.email));
    
    const viols = await Violation.find();
    console.log(`[Check] Found ${viols.length} violation(s)`);
    
    const logs = await ActivityLog.find();
    console.log(`[Check] Found ${logs.length} activity log(s)`);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkData();
