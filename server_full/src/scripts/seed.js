require('dotenv').config();
const connectDB = require('../db');
const Topic = require('../models/Topic');
const topics = require('../data/topics');

(async () => {
  try {
    await connectDB();
    for (const t of topics) {
      await Topic.updateOne({ name: t.name }, { $set: t }, { upsert: true });
    }
    console.log('🌱 Topics seeded');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
