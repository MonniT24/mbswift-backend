const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const Order =
  require("../models/Order");

const RiderRating =
  require("../models/RiderRating");

router.post(
  "/rider",
  authMiddleware,
  async(req,res)=>{

    try{

      const {
        orderId,
        rating,
        comment
      } = req.body;

      if(req.user.role !== "customer"){

        return res.status(403).json({
          message:"Only customers can rate riders"
        });
      }

      if(!orderId){

        return res.status(400).json({
          message:"Order ID is required"
        });
      }

      if(
        !rating ||
        Number(rating) < 1 ||
        Number(rating) > 5
      ){

        return res.status(400).json({
          message:"Rating must be between 1 and 5"
        });
      }

      const order =
        await Order.findById(orderId);

      if(!order){

        return res.status(404).json({
          message:"Order not found"
        });
      }

      if(order.status !== "delivered"){

        return res.status(400).json({
          message:"You can only rate after delivery is completed"
        });
      }

      if(!order.rider){

        return res.status(400).json({
          message:"This order has no rider"
        });
      }

      const customerId =
        order.customer?._id ||
        order.customer;

      if(
        customerId.toString() !==
        req.user._id.toString()
      ){

        return res.status(403).json({
          message:"You can only rate your own order"
        });
      }

      const existingRating =
        await RiderRating.findOne({
          order:order._id
        });

      if(existingRating){

        return res.status(400).json({
          message:"You have already rated this rider for this order"
        });
      }

      const newRating =
        await RiderRating.create({
          order:order._id,
          rider:order.rider,
          customer:req.user._id,
          rating:Number(rating),
          comment:comment || ""
        });

      res.status(201).json({
        message:"Thank you for rating your rider",
        rating:newRating
      });

    }catch(err){

      console.log(
        "RIDER RATING ERROR:",
        err
      );

      res.status(500).json({
        message:"Failed to submit rider rating"
      });
    }
  }
);

module.exports =
  router;