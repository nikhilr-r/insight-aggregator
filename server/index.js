const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. Load env vars first
dotenv.config();

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const aiRoutes = require('./routes/aiRoutes'); // <--- 1. Import AI Routes

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/ai', aiRoutes); // <--- 2. Use AI Routes

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));