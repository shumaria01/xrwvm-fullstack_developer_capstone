/*jshint esversion: 8 */
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;

// Enable CORS
app.use(cors());

// Use built-in JSON parser
app.use(express.json());

// Read data files into memory
const reviews_data = JSON.parse(fs.readFileSync('reviews.json', 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync('dealerships.json', 'utf8'));

// Connect to MongoDB inside Docker container named "mongo_db"
mongoose.connect('mongodb://mongo_db:27017/', { dbName: 'dealershipsDB' });

// Import mongoose models
const Reviews = require('./review');
const Dealerships = require('./dealership');

// Insert initial data on startup (clear old data first)
(async function () {
  try {
    await Reviews.deleteMany({});
    await Reviews.insertMany(reviews_data.reviews);

    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealerships_data.dealerships);

    console.log('Initial data loaded into MongoDB');
  } catch (error) {
    console.error('Error inserting initial data:', error);
  }
})();

// -------------------- ROUTES --------------------

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the Mongoose API');
});

// Fetch ALL reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Fetch reviews for a particular dealer by id
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({ dealership: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Fetch ALL dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

// Fetch dealerships by state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const documents = await Dealerships.find({ state: req.params.state });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships by state' });
  }
});

// Fetch dealer by id
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const document = await Dealerships.findOne({ id: parseInt(req.params.id) });
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealer by id' });
  }
});

// Insert a new review
app.post('/insert_review', async (req, res) => {
  try {
    const data = req.body;

    // Get the highest id and increment
    const documents = await Reviews.find().sort({ id: -1 });
    const new_id = documents.length > 0 ? documents[0].id + 1 : 1;

    const review = new Reviews({
      id: new_id,
      name: data.name,
      dealership: data.dealership,
      review: data.review,
      purchase: data.purchase,
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: data.car_year
    });

    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Start the server
app.listen(port, () => {
  console.log('Server is running on http://localhost:' + port);
});