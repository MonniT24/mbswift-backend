// backend/controllers/customerController.js

const Order =
  require("../models/Order");

const User =
  require("../models/User");

// ================= CREATE ORDER =================

exports.createOrder =
  async (
    req,
    res
  ) => {

    try {

      const {
        pickupLocation,
        dropoffLocation,
        items,
        total,
        distance
      } = req.body;

      // NO AUTO ASSIGNMENT

      const order =
        await Order.create({

          customer:
            req.user._id,

          pickupLocation,

          dropoffLocation,

          items,

          total,

          distance,

          status:
            "pending",

          rider:
            null
        });

      const populatedOrder =
        await Order.findById(
          order._id
        )

        .populate(
          "customer",
          "name phone"
        )

        .populate(
          "rider",
          "name phone status"
        );

      res.status(201).json({

        message:
          "Order created",

        order:
          populatedOrder
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });
    }
  };

// ================= GET CUSTOMER ORDERS =================

exports.getMyOrders =
  async (
    req,
    res
  ) => {

    try {

      const orders =
        await Order.find({

          customer:
            req.user._id
        })

        .populate(
          "customer",
          "name phone"
        )

        .populate(
          "rider",
          "name phone status"
        )

        .sort({
          createdAt:-1
        });

      res.json(
        orders
      );

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });
    }
  };

// ================= GET LOGGED USER =================

exports.getMe =
  async (
    req,
    res
  ) => {

    try {

      const user =
        await User.findById(
          req.user._id
        )

        .select(
          "-password"
        );

      res.json(
        user
      );

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });
    }
  };