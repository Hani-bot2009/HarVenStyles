const express = require("express");

const router = express.Router();

const {
  addToCart,
  getCartItems,
  removeCartItem,
  updateCartItem,
  clearCart,
  placeSingleOrder,
} = require("../controllers/cartController");


const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addToCart);

router.get("/", protect, getCartItems);

router.post(
  "/place-order/:id",
  protect,
  placeSingleOrder
);

router.delete("/:id", protect, removeCartItem);

router.put("/:id", protect, updateCartItem);

router.delete("/", protect, clearCart);

module.exports = router;