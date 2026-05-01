require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Company = require('../models/Company');

async function createEmployee() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find company admin
    const company = await Company.findOne({ companyDomain: 'vantix.com' });
    if (!company) {
      console.log('Company vantix.com not found. Creating it.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);

    await User.updateOne(
      { email: 'employee@vantix.com' },
      { 
        $set: {
          email: 'employee@vantix.com',
          password: hashedPassword,
          role: 'employee',
          isFirstLogin: false,
          orgId: company.adminId
        }
      },
      { upsert: true }
    );
    console.log('[Success] Created employee@vantix.com with password: Password123');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createEmployee();
