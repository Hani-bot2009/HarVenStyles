/* ================================================================
   HarVenStyles — routes/orderRoutes.js
   All routes require JWT via protect middleware.
================================================================ */
const express = require("express");
const router  = express.Router();

const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
  clearMyOrders,
  placeSingleItemOrder
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, placeOrder)    /* POST /api/orders       */
  .get(protect, getMyOrders);   /* GET  /api/orders       */
  router.get(
  "/admin/all",
  protect,
  getAllOrders
);

router.delete(
  "/clear/my-history",
  protect,
  clearMyOrders
);

router.get(
  "/admin/all",
  protect,
  getAllOrders
);

router.put(
  "/:id/cancel",
  protect,
  cancelOrder
);

router.post(
  "/item/:id",
  protect,
  placeSingleItemOrder
);


router.route("/:id")
  .get(protect, getOrderById)
  .put(protect, updateOrderStatus)
  .delete(protect, deleteOrder);  /* GET  /api/orders/:id   */

module.exports = router;