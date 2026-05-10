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

//GET ORDERS 

router.get(
  "/",
  authMiddleware,
  orderController.getOrders
);

//CREATE ORDER

router.post(
  "/",
  authMiddleware,
  orderController.createOrder
);

//UPDATE ORDER

router.put(
  "/:id",
  authMiddleware,
  orderController.updateOrder
);

//SEND MESSAGE

router.post(
  "/:id/message",
  authMiddleware,
  orderController.sendMessage
);

module.exports =
  router;