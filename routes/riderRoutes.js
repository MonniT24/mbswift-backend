const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getMe,
  getAllRiders
} = require(
  "../controllers/riderController"
);


router.get(

  "/me",

  authMiddleware,

  getMe
);


router.get(

  "/",

  authMiddleware,

  getAllRiders
);

module.exports =
  router;