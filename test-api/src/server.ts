import app from './app';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-api')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/health`);
});