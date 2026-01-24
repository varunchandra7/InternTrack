// Quick MongoDB Connection Test
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 Testing MongoDB Connection...\n');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('\n✨ Your database is ready to use!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error:', err.message);
    console.log('\n💡 Common fixes:');
    console.log('1. Check if password in .env has special characters (encode them)');
    console.log('2. Verify IP address is whitelisted in MongoDB Atlas');
    console.log('3. Ensure database user has proper permissions\n');
    process.exit(1);
  });
