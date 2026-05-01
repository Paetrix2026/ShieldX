require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function clearUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const u = await User.deleteMany({ role: 'employee' });
    console.log('[Clear] Deleted ' + u.deletedCount + ' Dummy Employees');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearUsers();
