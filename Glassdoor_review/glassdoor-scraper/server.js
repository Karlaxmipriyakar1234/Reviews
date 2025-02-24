const express = require('express');
const cors = require('cors');
const { fetchReviews } = require('./preprocess');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Define the /reviews route
app.get('/reviews', async (req, res) => {
  try {
    const reviews = await fetchReviews(); 
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
