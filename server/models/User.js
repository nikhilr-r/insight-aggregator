const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    preferences: { type: [String], default: [] },
    // NEW: Store country code (default 'in' for India)
    country: { type: String, default: 'in' }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);