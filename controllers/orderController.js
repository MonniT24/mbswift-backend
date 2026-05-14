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
        { rider:req.user._id },
        { status:"pending" }
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

      console.log(
  "BODY:",
  req.body
);

      const {

        pickupLocation,

        dropoffLocation,

        items

      } = req.body;

            const km =

        Number(
          (
            Math.random() * 12 + 2
          ).toFixed(1)
        );

      const amount =

        Math.ceil(
          km * 5
        );

      //CREATE ORDER

      const order =
        await Order.create({

          customer:req.user._id,

          pickupLocation,

          dropoffLocation,

          items,

          distance:km,

          total:amount
        });

      res.status(201)
      .json(order);

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

          message:
            "Order not found"
        });
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

        message:
          err.message
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
            sender,
            message:text
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

        .populate( "rider", "name phone latitude longitude status" );

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