const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes'); // <--- Added
const newsRoutes = require('./routes/newsRoutes');


dotenv.config();
connectDB();

// <--- Add this line!
const app = express();

app.use(cors()); 
app.use(express.json());


app.use('/api/users', userRoutes); // <--- Added

app.use('/api/news', newsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));