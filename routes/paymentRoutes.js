const express =
  require("express");

const axios =
  require("axios");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const Order =
  require("../models/Order");

router.post(
  "/momo/charge",
  authMiddleware,
  async(req,res)=>{

    try{

      const {
        email,
        amount,
        phone,
        provider,
        orderId
      } = req.body;

      if(
        !email ||
        !amount ||
        !phone ||
        !provider ||
        !orderId
      ){
        return res.status(400).json({
          message:"Email, amount, phone, provider, and orderId are required"
        });
      }

      const order =
        await Order.findById(orderId);

      if(!order){
        return res.status(404).json({
          message:"Order not found"
        });
      }

      const amountInPesewas =
        Math.round(
          Number(amount) * 100
        );

      const response =
        await axios.post(
          "https://api.paystack.co/charge",
          {
            email,
            amount:amountInPesewas,
            currency:"GHS",
            reference:
              `MBSWIFT_${orderId}_${Date.now()}`,
            mobile_money:{
              phone,
              provider
            },
            metadata:{
              orderId,
              customerId:req.user?._id
            }
          },
          {
            headers:{
              Authorization:
                `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              "Content-Type":"application/json"
            }
          }
        );

      order.paymentReference =
        response.data?.data?.reference || "";

      order.paymentStatus =
        "pending";

      order.isPaid =
        false;

      await order.save();

      return res.status(200).json(
        response.data
      );

    }catch(err){

      console.log(
        "MOMO CHARGE ERROR:",
        err.response?.data || err.message
      );

      return res.status(500).json({
        message:"MoMo charge failed",
        error:err.response?.data || err.message
      });
    }
  }
);

router.get(
  "/verify/:reference",
  authMiddleware,
  async(req,res)=>{

    try{

      const {
        reference
      } = req.params;

      const response =
        await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers:{
              Authorization:
                `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
          }
        );

      const paymentData =
        response.data?.data;

      const orderId =
        paymentData?.metadata?.orderId;

      if(!orderId){
        return res.status(400).json({
          message:"Order ID missing from payment metadata",
          paystack:response.data
        });
      }

      const order =
        await Order.findById(orderId);

      if(!order){
        return res.status(404).json({
          message:"Order not found",
          paystack:response.data
        });
      }

      if(paymentData.status === "success"){

        order.isPaid =
          true;

        order.paymentStatus =
          "paid";

        order.paymentReference =
          reference;

        order.paidAt =
          new Date();

      }else{

        order.isPaid =
          false;

        order.paymentStatus =
          paymentData.status || "failed";
      }

      await order.save();

      return res.status(200).json({
        message:
          paymentData.status === "success"
          ? "Payment verified and order marked as paid"
          : "Payment verified but not successful",
        paystack:response.data,
        order
      });

    }catch(err){

      console.log(
        "VERIFY PAYMENT ERROR:",
        err.response?.data || err.message
      );

      return res.status(500).json({
        message:"Payment verification failed",
        error:err.response?.data || err.message
      });
    }
  }
);

module.exports =
  router;