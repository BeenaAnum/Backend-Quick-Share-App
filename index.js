const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
  origin: 'https://frontend-quick-share-app.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

/* =========================
   MONGODB CONNECTION
========================= */

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);

    isConnected = true;

    console.log('✅ MongoDB Connected');

  } catch (err) {
    console.error('❌ MongoDB Error:', err);
  }
};

connectDB();

/* =========================
   SCHEMA
========================= */

const ShareSchema = new mongoose.Schema({
  ip: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800
  }
});

const Share = mongoose.models.Share || mongoose.model('Share', ShareSchema);

/* =========================
   ROUTES
========================= */

app.get('/', async (req, res) => {
  try {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress;

    const data = await Share.findOne({ ip });

    res.json(data || { text: '' });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Server Error'
    });
  }
});

app.post('/save', async (req, res) => {
  try {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress;

    const { text } = req.body;

    const updated = await Share.findOneAndUpdate(
      { ip },
      {
        text,
        createdAt: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json(updated);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Save Error'
    });
  }
});

/* =========================
   EXPORT
========================= */

module.exports = app;
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();
// const app = express();
// // Middleware
// // app.use(cors());
// app.use(cors({
//   origin: "https://frontend-quick-share-app.vercel.app", 
//   methods: ["GET", "POST"],
//   credentials: true
// }));
// app.use(express.json());
// // MongoDB Connection

// mongoose.connect(process.env.MONGO_URI)
// .then(() => console.log("MongoDB Connected"))
// .catch(err => console.error("DB Connection Error:", err));
// // Schema & Model (Data 30 min baad khud delete ho jayega)
// const ShareSchema = new mongoose.Schema({
// ip: String, text: String, createdAt: { type: Date, default: Date.now, expires: 1800 }
// });
// const Share = mongoose.model('Share', ShareSchema);
// // share is collection name, ip aur text fields ke sath, createdAt field 30 min baad auto delete ke liye set hai

// // Routes
// app.get('/', async (req, res) => {
// // Vercel par IP headers se milti hai
// const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
// try {
// const data = await Share.findOne({ ip });
// res.json(data || { text: "" });
// } catch (err) {
// res.status(500).json({ error: "Server Error" });
// }
// });

// app.post('/save', async (req, res) => {
// const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

// const { text } = req.body;
// try {
// const updated = await Share.findOneAndUpdate(
// { ip }, { text, createdAt: new Date() }, { upsert: true, new: true }
// );
// res.json(updated);
// } catch (err) {
// res.status(500).json({ error: "Save Error" });
// }
// });

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// module.exports = app; //important for vercel deployment 
