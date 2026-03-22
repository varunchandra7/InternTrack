const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_FROM',
  'GEMINI_API_KEY'
];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('Set these variables in your hosting provider before starting the server.');
    process.exit(1);
  }
}

module.exports = {
  validateEnv,
  requiredEnvVars
};
