/**
 * Create Admin User
 * Run this script to create an admin account
 * 
 * Usage: node createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL = 'admin@interntrack.com';
const ADMIN_PASSWORD = 'admin@123';
const ADMIN_NAME = 'Admin User';

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        return createAdmin();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        
        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists');
            console.log(`   Email: ${ADMIN_EMAIL}`);
            console.log(`   You can login with this account`);
            process.exit(0);
        }

        // Create admin user
        const adminUser = new User({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
            isVerified: true
        });

        await adminUser.save();

        console.log('✅ Admin user created successfully!');
        console.log('\n📧 Admin Credentials:');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}
