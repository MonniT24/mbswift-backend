const axios =
  require("axios");

const Order =
  require("../models/Order");

exports.initializePayment =
  async(req,res)=>{

    try{

      const {
        orderId
      } = req.body;

      if(!orderId){
        return res.status(400).json({
          message:"Order ID is required"
        });
      }

      const order =
        await Order.findById(orderId)
        .populate("customer");

      if(!order){
        return res.status(404).json({
          message:"Order not found"
        });
      }

      const amount =
        Number(order.total || order.amount || 0);

      if(amount <= 0){
        return res.status(400).json({
          message:"Invalid order amount"
        });
      }

      const response =
        await axios.post(
          "https://api.paystack.co/transaction/initialize",
          {
            email:
              order.customer?.email ||
              req.user.email,
            amount:amount * 100,
            currency:"GHS",
            reference:
              `MB-${order._id}-${Date.now()}`,
            metadata:{
              orderId:order._id.toString(),
              customerId:req.user._id.toString()
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

      res.json({
        authorization_url:
          response.data.data.authorization_url,
        reference:
          response.data.data.reference
      });

    }catch(error){

      console.log(
        "PAYSTACK INITIALIZE ERROR:",
        error.response?.data ||
        error.message
      );

      res.status(500).json({
        message:"Failed to initialize payment"
      });
    }
  };

exports.verifyPayment =
  async(req,res)=>{

    try{

      const {
        reference
      } = req.params;

      if(!reference){
        return res.status(400).json({
          message:"Payment reference is required"
        });
      }

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

      const data =
        response.data.data;

      if(data.status !== "success"){
        return res.status(400).json({
          message:"Payment not successful",
          status:data.status
        });
      }

      const orderId =
        data.metadata?.orderId;

      const order =
        await Order.findById(orderId);

      if(!order){
        return res.status(404).json({
          message:"Order not found"
        });
      }

      order.isPaid = true;
      order.paymentStatus = "paid";
      order.paymentReference = reference;
      order.paidAt = new Date();

      await order.save();

      res.json({
        message:"Payment verified successfully",
        order
      });

    }catch(error){

      console.log(
        "PAYSTACK VERIFY ERROR:",
        error.response?.data ||
        error.message
      );

      res.status(500).json({
        message:"Failed to verify payment"
      });
    }
  };