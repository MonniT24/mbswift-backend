const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getMe,
  getAllRiders,
  updateRiderProfile
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

router.put(

  "/profile",

  authMiddleware,

  updateRiderProfile
);

module.exports =
  router;