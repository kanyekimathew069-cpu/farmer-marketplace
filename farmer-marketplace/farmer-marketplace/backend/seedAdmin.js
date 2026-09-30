// One-off script to create the first admin account, since admins are never
// created through public registration. Run: node seedAdmin.js
require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");

async function run() {
  await connectDB();

  const email = process.env.SEED_ADMIN_EMAIL || "admin@farmermarketplace.com";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const admin = await User.create({
    name: process.env.SEED_ADMIN_NAME || "Super Admin",
    email,
    password: process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!",
    role: "admin",
  });

  console.log(`Admin created: ${admin.email} (change the password after first login)`);
  process.exit(0);
}

run();
