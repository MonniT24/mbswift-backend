const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const orderController =
  require(
    "../controllers/orderController"
  );

// GET ORDERS 

router.get(
  "/",
  authMiddleware,
  orderController.getOrders
);

// CREATE ORDER

router.post(
  "/",
  authMiddleware,
  orderController.createOrder
);

// UPDATE ORDER TO PAID AFTER MOMO SUCCESS

router.put(
  "/:id/pay",
  authMiddleware,
  orderController.updateOrderToPaid
);

// COMPLETE DELIVERY WITH CUSTOMER CODE

router.put(
  "/:id/complete-delivery",
  authMiddleware,
  orderController.completeDeliveryWithCode
);

// UPDATE ORDER

router.put(
  "/:id",
  authMiddleware,
  orderController.updateOrder
);

// SEND MESSAGE

router.post(
  "/:id/message",
  authMiddleware,
  orderController.sendMessage
);

module.exports =
  router;