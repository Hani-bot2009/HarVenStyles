const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

 items: [
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    name: String,
    image: String,
    price: Number,
    size: String,

    quantity: {
      type: Number,
      default: 1,
    },
  },
],

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "Processing",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);