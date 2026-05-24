const Order =
  require("../models/Order");

const generateDeliveryCode =
  require("../utils/generateDeliveryCode");

const sanitizeOrderForRider =
  (order)=>{

    if(!order){
      return order;
    }

    const responseOrder =
      order.toObject
      ? order.toObject()
      : {...order};

    delete responseOrder.deliveryCode;

    return responseOrder;
  };

const isBlockedRider =
  (user)=>{

    return (
      user?.role === "rider"
      &&
      (
        user?.status === "suspended" ||
        user?.riderAccountStatus === "temporary_suspended" ||
        user?.riderAccountStatus === "permanent_suspended"
      )
    );
  };

const blockedRiderMessage =
  "Your rider account is suspended. You can login, but you cannot view, accept, update, or complete delivery orders.";

// GET ORDERS

exports.getOrders =
  async(
    req,
    res
  )=>{

    try{

      let orders;

      if(req.user.role === "customer"){

        orders =
          await Order.find({

            customer:req.user._id
          })

          .populate(
            "customer",
            "name phone"
          )

          .populate(
            "rider",
            "name phone latitude longitude status riderAccountStatus riderStatusReason"
          )

          .sort({
            createdAt:-1
          });

      }else if(req.user.role === "rider"){

        if(
          isBlockedRider(
            req.user
          )
        ){

          return res.json(
            []
          );
        }

        orders =
          await Order.find({

            $or:[

              {
                status:"pending"
              },

              {
                rider:req.user._id,
                status:{
                  $ne:"cancelled"
                }
              }
            ]
          })

          .select("-deliveryCode")

          .populate(
            "customer",
            "name phone"
          )

          .populate(
            "rider",
            "name phone latitude longitude status riderAccountStatus riderStatusReason"
          )

          .sort({
            createdAt:-1
          });

      }else{

        orders =
          await Order.find()

          .populate(
            "customer",
            "name phone"
          )

          .populate(
            "rider",
            "name phone latitude longitude status riderAccountStatus riderStatusReason"
          )

          .sort({
            createdAt:-1
          });
      }

      res.json(
        orders
      );

    }catch(err){

      console.log(err);

      res.status(500)
      .json({
        message:err.message
      });
    }
  };

// CREATE ORDER

exports.createOrder =
  async(req,res)=>{

    try{

      console.log(
        "✅ NEW CREATE ORDER CODE IS RUNNING"
      );

      console.log(
        "BODY:",
        req.body
      );

      const {
        pickupLocation,
        dropoffLocation,
        distance,
        deliveryTime,
        total,
        items,
        paymentMethod,
        momoNumber
      } = req.body;

      if(
        !pickupLocation ||
        !dropoffLocation ||
        !distance ||
        !total ||
        !paymentMethod
      ){

        return res.status(400)
        .json({
          message:
            "Pickup, dropoff, distance and total are required"
        });
      }

      if(
        paymentMethod === "momo" &&
        !momoNumber
      ){

        return res.status(400)
        .json({
          message:
            "Mobile Money number is required"
        });
      }

      const order =
        await Order.create({

          customer:req.user._id,

          pickupLocation,

          dropoffLocation,

          items,

          distance:Number(distance),

          deliveryTime,

          total:Number(total),

          paymentMethod,

          momoNumber:
            paymentMethod === "momo"
            ? momoNumber
            : "",

          status:"pending",

          deliveryCode:
            generateDeliveryCode(),

          deliveryCodeVerified:
            false,

          deliveredAt:
            null
        });

      const created =
        await Order.findById(
          order._id
        )

        .populate(
          "customer",
          "name phone"
        )

        .populate(
          "rider",
          "name phone latitude longitude status riderAccountStatus riderStatusReason"
        );

      const io =
        req.app.get("io");

      if(io){

        io.emit(
          "orderUpdated"
        );
      }

      res.status(201)
      .json(
        created
      );

    }catch(err){

      console.log(err);

      res.status(500)
      .json({
        message:err.message
      });
    }
  };

// UPDATE ORDER

exports.updateOrder =
  async(req,res)=>{

    try{

      console.log(
        "REQ USER:",
        req.user
      );

      console.log(
        "REQ BODY:",
        req.body
      );

      const order =
        await Order.findById(
          req.params.id
        );

      if(!order){

        return res.status(404)
        .json({
          message:"Order not found"
        });
      }

      if(
        isBlockedRider(
          req.user
        )
      ){

        return res.status(403)
        .json({
          message:blockedRiderMessage
        });
      }

      if(
        req.user.role === "rider" &&
        req.body.status === "delivered"
      ){

        return res.status(400)
        .json({
          message:
            "Enter the customer OTP number to complete this delivery."
        });
      }

      if(
        req.user.role === "rider" &&
        req.body.status === "accepted"
      ){

        const activeDelivery =
          await Order.findOne({

            rider:req.user._id,

            status:{
              $in:[
                "accepted",
                "picked",
                "delivering"
              ]
            },

            _id:{
              $ne:order._id
            }
          });

        if(activeDelivery){

          return res.status(400)
          .json({
            message:
              "You already have an active delivery. Complete it before accepting another order."
          });
        }

        if(
          order.rider &&
          String(order.rider) !== String(req.user._id)
        ){

          return res.status(400)
          .json({
            message:
              "This order has already been accepted by another rider."
          });
        }

        if(order.status !== "pending"){

          return res.status(400)
          .json({
            message:
              "Only pending orders can be accepted."
          });
        }

        req.body.rider =
          req.user._id;

        req.body.riderId =
          req.user._id;
      }

      // FRAUD / CANCEL TRACKING

      if(req.body.status === "cancelled"){

        order.cancelCount += 1;

        order.cancelReason =
          req.body.cancelReason || "";

        if(req.user.role === "customer"){

          order.customerCancelCount += 1;

          order.cancelledBy =
            "customer";
        }

        if(req.user.role === "rider"){

          order.riderCancelCount += 1;

          order.cancelledBy =
            "rider";
        }

        if(req.user.role === "admin"){

          order.cancelledBy =
            "admin";
        }

        if(
          order.cancelCount >= 2 ||
          order.customerCancelCount >= 2 ||
          order.riderCancelCount >= 2
        ){

          order.flagged =
            true;
        }
      }

      Object.assign(
        order,
        req.body
      );

      await order.save();

      const updated =
        await Order.findById(
          order._id
        )

        .populate(
          "customer",
          "name phone"
        )

        .populate(
          "rider",
          "name phone latitude longitude status riderAccountStatus riderStatusReason"
        );

      const io =
        req.app.get("io");

      if(io){

        io.emit(
          "orderUpdated"
        );
      }

      if(req.user.role === "rider"){

        return res.json(
          sanitizeOrderForRider(
            updated
          )
        );
      }

      res.json(
        updated
      );

    }catch(err){

      console.log(err);

      res.status(500)
      .json({
        message:err.message
      });
    }
  };

// UPDATE ORDER TO PAID AFTER MOMO SUCCESS

exports.updateOrderToPaid =
  async(req,res)=>{

    try{

      const order =
        await Order.findById(
          req.params.id
        );

      if(!order){

        return res.status(404)
        .json({
          message:"Order not found"
        });
      }

      order.isPaid =
        true;

      order.paidAt =
        Date.now();

      order.paymentResult = {

        reference:
          req.body.reference || "",

        status:
          req.body.status || "",

        channel:
          req.body.channel || "",

        amount:
          req.body.amount || 0,

        currency:
          req.body.currency || ""
      };

      const updated =
        await order.save();

      const populatedOrder =
        await Order.findById(
          updated._id
        )

        .populate(
          "customer",
          "name phone"
        )

        .populate(
          "rider",
          "name phone latitude longitude status riderAccountStatus riderStatusReason"
        );

      const io =
        req.app.get("io");

      if(io){

        io.emit(
          "orderUpdated"
        );
      }

      res.json(
        populatedOrder
      );

    }catch(err){

      console.log(err);

      res.status(500)
      .json({
        message:"Could not update order payment",
        error:err.message
      });
    }
  };

// COMPLETE DELIVERY WITH CUSTOMER CODE

exports.completeDeliveryWithCode =
  async(req,res)=>{

    try{

      const order =
        await Order.findById(
          req.params.id
        );

      if(!order){

        return res.status(404)
        .json({
          message:"Order not found"
        });
      }

      if(req.user.role !== "rider"){

        return res.status(403)
        .json({
          message:"Only riders can complete deliveries"
        });
      }

      if(
        isBlockedRider(
          req.user
        )
      ){

        return res.status(403)
        .json({
          message:blockedRiderMessage
        });
      }

      if(
        !order.rider ||
        String(order.rider) !== String(req.user._id)
      ){

        return res.status(403)
        .json({
          message:"You are not assigned to this order"
        });
      }

      if(order.status === "delivered"){

        return res.status(400)
        .json({
          message:"This order has already been delivered"
        });
      }

      const deliveryCode =
        String(
          req.body.deliveryCode || ""
        ).trim();

      if(!deliveryCode){

        return res.status(400)
        .json({
          message:"OTP number is required"
        });
      }

      if(!/^\d{4}$/.test(deliveryCode)){

        return res.status(400)
        .json({
          message:"OTP number must be 4 digits"
        });
      }

      if(order.deliveryCode !== deliveryCode){

        return res.status(400)
        .json({
          message:"Invalid OTP number"
        });
      }

     order.status =
  "delivered";

order.deliveryCodeVerified =
  true;

order.deliveredAt =
  new Date();

// CASH ON DELIVERY PAYMENT CONFIRMATION

console.log(
  "PAYMENT METHOD BEFORE CASH CHECK:",
  order.paymentMethod
);

if(
  order.paymentMethod === "cash"
){

  order.paymentStatus =
    "paid";

  order.isPaid =
    true;

  order.cashCollectedByRider =
    true;

  order.cashCollectedAt =
    new Date();
}

      await order.save();

      const updated =
        await Order.findById(
          order._id
        )

        .populate(
          "customer",
          "name phone"
        )

        .populate(
          "rider",
          "name phone latitude longitude status riderAccountStatus riderStatusReason"
        );

      const io =
        req.app.get("io");

      if(io){

        io.emit(
          "orderUpdated"
        );
      }

      res.json({
        message:"Delivery completed successfully",
        order:sanitizeOrderForRider(
          updated
        )
      });

    }catch(err){

      console.log(err);

      res.status(500)
      .json({
        message:err.message
      });
    }
  };

// SEND MESSAGE

exports.sendMessage =
  async(
    req,
    res
  )=>{

    try{

      const order =
        await Order.findById(
          req.params.id
        );

      if(!order){

        return res.status(404)
        .json({
          message:"Order not found"
        });
      }

      if(
        isBlockedRider(
          req.user
        )
      ){

        return res.status(403)
        .json({
          message:blockedRiderMessage
        });
      }

      const {
        sender,
        text
      } = req.body;

      order.messages.push({

        sender,

        text,

        createdAt:
          new Date()
      });

      await order.save();

      const io =
        req.app.get("io");

      if(io && order.rider){

        io.to(
          order.rider.toString()
        ).emit(
          "newMessage",
          {
            type:"message",
            orderId:order._id,
            sender:sender,
            message:text,
            text:text
          }
        );
      }

      if(io && order.customer){

        io.to(
          order.customer.toString()
        ).emit(
          "newMessage",
          {
            type:"message",
            orderId:order._id,
            sender:sender,
            message:text,
            text:text
          }
        );
      }

      if(io){

        io.emit(
          "orderUpdated"
        );
      }

      const updated =
        await Order.findById(
          order._id
        )

        .populate(
          "customer",
          "name phone"
        )

        .populate(
          "rider",
          "name phone latitude longitude status riderAccountStatus riderStatusReason"
        );

      if(req.user.role === "rider"){

        return res.json(
          sanitizeOrderForRider(
            updated
          )
        );
      }

      res.json(
        updated
      );

    }catch(err){

      console.log(err);

      res.status(500)
      .json({
        message:err.message
      });
    }
  };