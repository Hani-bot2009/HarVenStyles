const Cart = require("../models/cartModel");

const addToCart = async (req, res) => {

  try {

   const {
  productId,
  quantity,
} = req.body;

    const existingItem = await Cart.findOne({
  user: req.user._id,
  product: productId,
});
    if (existingItem) {

      existingItem.quantity += 1;

      await existingItem.save();

      return res.json(existingItem);
    }

    const cartItem = await Cart.create({
  user: req.user._id,
  product: productId,
  quantity,
});

    res.status(201).json(cartItem);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

const getCartItems = async (req, res) => {

  try {

    const items = await Cart.find({
      user: req.user._id,
    }).populate("product");

    const total = items.reduce((sum, item) => {
  return sum + ((item.product?.price || 0) * item.quantity);
}, 0);

res.json({
  items,
  total,
});

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

const clearCart = async (req, res) => {

  console.log("CLEAR CART HIT");
  console.log("USER ID:", req.user._id);

  try {

    const result = await Cart.deleteMany({
      user: req.user._id,
    });

    console.log("DELETE RESULT:", result);

    res.json({
      message: "Cart cleared successfully",
    });

  } catch (error) {

    console.log("CLEAR CART ERROR:");
    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

};

const removeCartItem = async (req, res) => {

  try {

    const item = await Cart.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    res.json({
      message: "Item removed successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

const updateCartItem = async (req, res) => {

  try {

    const item = await Cart.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    item.quantity = req.body.quantity;

    await item.save();

    res.json(item);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

const Order = require("../models/orderModel");

const placeSingleOrder = async (req, res) => {

  try {

    const cartItem = await Cart.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("product");

    if (!cartItem) {

      return res.status(404).json({
        message: "Cart item not found",
      });

    }

    const order = await Order.create({

      user: req.user._id,

      items: [{
        product: cartItem.product._id,
        name: cartItem.product.name,
        image: cartItem.product.image,
        price: cartItem.product.price,
        quantity: cartItem.quantity,
      }],

      totalPrice:
        cartItem.product.price *
        cartItem.quantity,

      status: "Pending",

    });

    await Cart.deleteOne({
      _id: cartItem._id,
    });

    res.status(201).json(order);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
  updateCartItem,
  clearCart,
  placeSingleOrder
};