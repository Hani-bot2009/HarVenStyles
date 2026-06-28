/* ================================================================
   HarVenStyles — controllers/orderController.js

   POST   /api/orders       → place order (from cart)
   GET    /api/orders        → get user's order history
   GET    /api/orders/:id    → get single order detail
================================================================ */
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");

/* ── helpers ──────────────────────────────────────────────────── */
const bad       = (res, msg)  => res.status(400).json({ message: msg });
const notFound  = (res, msg)  => res.status(404).json({ message: msg || "Not found" });
const serverErr = (res, err)  => {
  console.error("[OrderController]", err);
  res.status(500).json({ message: "Server error", error: err.message });
};

/* ── POST /api/orders ─────────────────────────────────────────── */
/*  Converts the user's entire current cart into a single order.
    Cart is cleared on success.
    Body: { note? }  (optional customer note)                      */
const placeOrder = async (req, res) => {
  try {

  /* 1. Fetch ALL cart items for this user */
  const cartItems = await Cart.find({
  user: req.user._id,
}).populate("product");
  console.log("FIRST CART ITEM:", cartItems[0]);
  console.log("ORDER USER:", req.user._id);
  console.log("CART ITEMS:", cartItems);

  console.log("ORDER USER:", req.user._id);
  console.log("CART ITEMS FOUND:", cartItems.length);

  if (!cartItems || cartItems.length === 0) {
    return bad(
      res,
      "Your cart is empty — add items before placing an order."
    );
  }

  /* 2. Convert cart items into order items */
 const orderItems = cartItems.map((item) => ({
  product: item.product._id,
  name: item.product.name,
  image: item.product.image,
  price: item.product.price,
  quantity: item.quantity,
}));
  /* 3. Calculate total */
 const totalPrice = cartItems.reduce(
  (sum, item) => sum + item.product.price * item.quantity,
  0
);

  /* 4. Create order */
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalPrice,
    status: "Pending",
  });

  /* 5. Remove all cart items for this user */
  await Cart.deleteMany({
    user: req.user._id,
  });

  res.status(201).json({
    message: "Order placed successfully",
    orderId: order._id,
    totalPrice: order.totalPrice,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items,
  });

} catch (err) {
  serverErr(res, err);
}
};

const placeSingleItemOrder = async (req, res) => {

  try {

    const cartItem = await Cart.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate("product");

    if (!cartItem) {

      return res.status(404).json({
        message: "Cart item not found"
      });

    }

    const order = await Order.create({

      user: req.user._id,

      items: [{
        product: cartItem.product._id,
        name: cartItem.product.name,
        image: cartItem.product.image,
        price: cartItem.product.price,
        quantity: cartItem.quantity
      }],

      totalPrice:
        cartItem.product.price *
        cartItem.quantity,

      status: "Pending"

    });

    await Cart.findByIdAndDelete(
      cartItem._id
    );

    res.status(201).json(order);

  } catch (err) {

    serverErr(res, err);

  }

};

/* ── GET /api/orders ──────────────────────────────────────────── */
/*  Returns all orders for the logged-in user, newest first.       */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();                /* plain JS objects — faster for reads */

    res.json(orders);
  } catch (err) {
    serverErr(res, err);
  }
};

/* ── GET /api/orders/:id ──────────────────────────────────────── */
/*  Returns a single order — only if it belongs to the user.       */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) return notFound(res, "Order not found.");
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json(order);
  } catch (err) {
    serverErr(res, err);
  }
};
const getAllOrders = async (req, res) => {
  try {

    if (!req.user.isAdmin) {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.json(orders);

  } catch (err) {
    serverErr(res, err);
  }
};

const deleteOrder = async (req, res) => {

  try {

    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      message: "Order deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

const updateOrderStatus = async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order) {

      return res.status(404).json({
        message: "Order not found"
      });

    }

    order.status = req.body.status;

    await order.save();

    res.json(order);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

const cancelOrder = async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order) {

      return res.status(404).json({
        message: "Order not found"
      });

    }

    /* user can cancel only his own order */
    if (order.user.toString() !== req.user._id.toString()) {

      return res.status(403).json({
        message: "Access denied"
      });

    }

    order.status = "Cancelled";

    await order.save();

    res.json(order);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

const clearMyOrders = async (req, res) => {

  try {

    const activeOrders = await Order.find({
      user: req.user._id,
      status: {
  $nin: ["Delivered", "Cancelled"]
}
    });

    if (activeOrders.length > 0) {

      return res.status(400).json({
        message:
          "You can clear history only after all orders are delivered."
      });

    }

    await Order.deleteMany({
      user: req.user._id
    });

    res.json({
      message: "History cleared"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
  clearMyOrders,
  placeSingleItemOrder
};