require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = process.env.PORT || 8009;
const mongoose= require('mongoose');

const authRouter = require('./routers/authRouter');

// Ensure required env vars are present
if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set in .env. MongoDB connection will fail.');
}
if (!process.env.TOKEN_SECRET) {
  console.warn('Warning: TOKEN_SECRET is not set. Signin will fail until it is set.');
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Database connected.');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    // If Mongo fails to connect, keep the process alive but log details so
    // Postman or clients don't see an abrupt crash. In development you
    // might prefer process.exit(1) to fail fast.
  });

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the server' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Try accessing: http://localhost:${PORT}`);
});

// Global error handlers to prevent uncaught exceptions/rejections from
// crashing the Node process silently and to provide clearer terminal output.
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason && reason.stack ? reason.stack : reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err && err.stack ? err.stack : err);
});
