import express from 'express';

import dotenv from 'dotenv'
import userRouter from './routes/user.router.js'
import connectDB from './database/db.js';

const app = express();
dotenv.config();

// Middleware
app.use(express.json());

const port = process.env.PORT || 9000;
const MONGODB_URL = process.env.MONOGO_DB_URL;

app.use('/api', userRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB(MONGODB_URL);
})