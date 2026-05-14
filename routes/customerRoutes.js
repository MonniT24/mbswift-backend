const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {

  createOrder,
  getMyOrders,
  getMe,
  updateProfile

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

//UPDATE CUSTOMER PROFILE

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

//CREATE ORDER

router.post(
  "/orders",
  authMiddleware,
  createOrder
);

module.exports =
  router;