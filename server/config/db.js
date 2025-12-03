const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    // We try to connect using the secret URI from our .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If something goes wrong, we print the error and stop the server
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;