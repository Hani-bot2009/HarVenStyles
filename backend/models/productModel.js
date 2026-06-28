const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  sizes: {
    type: [String],
    default: ["S", "M", "L", "XL"],
  },

  colors: {
    type: [String],
    default: ["Black", "Off White", "Brown"],
  },

  category: {
    type: String,
    default: "Oversized T-Shirt",
  },

  fabric: {
    type: String,
    default: "100% Cotton - 240 GSM",
  },

  inStock: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Product", productSchema);