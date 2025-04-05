require('dotenv').config();
const app = require('./src/app');
const { initializeTables } = require('./src/config/db.config');

const PORT = process.env.PORT || 3000;

// Initialize DynamoDB tables
(async () => {
  try {
    await initializeTables();
    console.log('DynamoDB tables initialized');
  } catch (error) {
    console.error('Error initializing DynamoDB tables:', error);
  }
})();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 