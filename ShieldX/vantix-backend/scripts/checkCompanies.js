require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');

async function listCompanies() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const companies = await Company.find({}, { companyDomain: 1, adminEmail: 1 });
    console.log('[Companies] =>', JSON.stringify(companies, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listCompanies();
