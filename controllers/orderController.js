const Order =
  require("../models/Order");

const User =
  require("../models/User");

const fetch =
  (...args)=>

    import("node-fetch")
    .then(({default:fetch})=>
      fetch(...args)
    );

//GET ORDERS

exports.getOrders =
  async (
    req,
    res
  ) => {

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
      "name phone latitude longitude status"
    )

    .sort({
      createdAt:-1
    });

}else if(req.user.role === "rider"){

  orders =
    await Order.find({

  $or:[

    { status:"pending" },

    { rider:req.user._id }

  ]

})

    .populate(
      "customer",
      "name phone"
    )

    .populate(
      "rider",
      "name phone latitude longitude status"
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
      "name phone latitude longitude status"
    )

    .sort({
      createdAt:-1
    });
}

res.json(orders);

    }catch(err){

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });
    }
  };

//CREATE ORDER

exports.createOrder =
  async(req,res)=>{

    try{

      console.log("✅ NEW CREATE ORDER CODE IS RUNNING");

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

        items

      } = req.body;

      if(
        !pickupLocation ||
        !dropoffLocation ||
        !distance ||
        !total
      ){

        return res.status(400)
        .json({

          message:
            "Pickup, dropoff, distance and total are required"
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

          status:"pending"
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
          "name phone latitude longitude status"
        );

      const io =
        req.app.get("io");

      if(io){

        io.emit(
          "orderUpdated"
        );
      }

      res.status(201)
      .json(created);

    }catch(err){

      console.log(err);

      res.status(500)
      .json({

        message:
          err.message
      });
    }
  };

//UPDATE ORDER

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
        req.user.role === "rider" &&
        req.user.status === "suspended"
      ){

        return res.status(403)
        .json({
          message:"Your rider account has been suspended. You cannot accept or update deliveries."
        });
      }

      // FRAUD / CANCEL TRACKING

if(req.body.status === "cancelled"){

  order.cancelCount += 1;

  order.cancelReason =
    req.body.cancelReason || "";

  // CUSTOMER CANCEL

  if(req.user.role === "customer"){

    order.customerCancelCount += 1;

    order.cancelledBy =
      "customer";
  }

  // RIDER CANCEL

  if(req.user.role === "rider"){

    order.riderCancelCount += 1;

    order.cancelledBy =
      "rider";
  }

  // ADMIN CANCEL

  if(req.user.role === "admin"){

    order.cancelledBy =
      "admin";
  }

  // AUTO FLAG

  if(

    order.cancelCount >= 2 ||

    order.customerCancelCount >= 2 ||

    order.riderCancelCount >= 2

  ){

    order.flagged = true;
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
          "name phone latitude longitude status"
        );

      const io =
        req.app.get("io");

      io.emit(
        "orderUpdated"
      );

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
//SEND MESSAGE

exports.sendMessage =
  async (
    req,
    res
  ) => {

    try{

      const order =
        await Order.findById(
          req.params.id
        );

      if(!order){

        return res.status(404).json({
          message:
            "Order not found"
        });
      }

      const {
        sender,
        text
      } = req.body;

      order.messages.push({

        sender,
        text,
        createdAt:new Date()
      });

      await order.save();

      const io =
        req.app.get("io");

      if(order.rider){

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

      if(order.customer){

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

      io.emit(
        "orderUpdated"
      );

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
          "name phone latitude longitude status"
        );

      res.json(
        updated
      );

    }catch(err){

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });
    }
  };