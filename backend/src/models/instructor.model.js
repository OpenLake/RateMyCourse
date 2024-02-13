const mongoose = require("mongoose");

const instructSchema = new mongoose.Schema({
  instructorName: {
    type: String,
    required: true,
  },
  instructRating: {
    type: Number,
    required: true,
  },
  instructRatingCount: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Instructor = mongoose.model(
  "Instructor",
  instructSchema,
  "instructor"
);

module.exports = {
  Instructor,
};
