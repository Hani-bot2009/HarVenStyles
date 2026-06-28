/* ================================================================
   HarVenStyles — models/Order.js
   One document per placed order (not per item).
   Items are snapshotted at order time so product edits don't
   retroactively change history.
================================================================ */
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, /* soft ref — ok if product deleted */
  name:     { type: String,  required: true },
  image:    { type: String,  default: "" },
  price:    { type: Number,  required: true },
  size:     { type: String,  default: "" },
  quantity: { type: Number,  required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,  /* fast per-user queries */
    },
    items:      { type: [orderItemSchema], required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type:    String,
      enum:    ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    note: { type: String, default: "" }, /* optional customer note */
  },
  { timestamps: true }   /* createdAt + updatedAt auto-managed */
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;