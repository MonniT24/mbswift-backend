const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {

  createOrder,
  getMyOrders,
  getMe

} = require(
  "../controllers/customerController"
);

//GET LOGGED USER

router.get(
  "/me",
  authMiddleware,
  getMe
);

//GET CUSTOMER ORDERS

router.get(
  "/orders",
  authMiddleware,
  getMyOrders
);

//CREATE ORDER

router.post(
  "/orders",
  authMiddleware,
  createOrder
);

module.exports =
  router;