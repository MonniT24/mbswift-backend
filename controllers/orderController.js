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

      const orders =
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

      res.json(
        orders
      );

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

      const {

        pickupLocation,

        dropoffLocation,

        items

      } = req.body;

      //GET PICKUP LOCATION

      const pickupRes =
        await fetch(

          `https://nominatim.openstreetmap.org/search?format=json&q=${pickupLocation}, Accra, Ghana`
        );

      const pickupData =
        await pickupRes.json();

      //GET DROPOFF LOCATION

      const dropoffRes =
        await fetch(

          `https://nominatim.openstreetmap.org/search?format=json&q=${dropoffLocation}, Accra, Ghana`
        );

      const dropoffData =
        await dropoffRes.json();

      if(

        !pickupData.length ||

        !dropoffData.length

      ){

        return res.status(400)
        .json({

          message:
            "Location not found"
        });
      }

      //COORDINATES

      const lat1 =
        parseFloat(
          pickupData[0].lat
        );

      const lon1 =
        parseFloat(
          pickupData[0].lon
        );

      const lat2 =
        parseFloat(
          dropoffData[0].lat
        );

      const lon2 =
        parseFloat(
          dropoffData[0].lon
        );

      //ROAD DISTANCE

      const orsRes =
        await fetch(

          "https://api.openrouteservice.org/v2/directions/driving-car",

          {

            method:"POST",

            headers:{

              "Content-Type":
                "application/json",

              Authorization:
                "Bearer eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjI2OGMyNGU0YjkwYzRjMDk4ZmVjNzlmMzNlMjA1NTYwIiwiaCI6Im11cm11cjY0In0="
            },

            body:JSON.stringify({

              coordinates:[

                [lon1,lat1],

                [lon2,lat2]
              ],

              instructions:false
            })
          }
        );

      const orsData =
        await orsRes.json();

      console.log(
        "ORS:",
        orsData
      );

      if(!orsData.routes){

        return res.status(400)
        .json({

          message:
            "Route not found"
        });
      }

      const meters =

        orsData.routes[0]
        .summary.distance;

      const km =
        Number(

          (meters / 1000)
          .toFixed(1)

        );

      //PRICE

      const amount =

        Math.ceil(

          3 + (km * 0.5)

        );

      //CREATE ORDER

      const order =
        await Order.create({

          customer:req.user.id,

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
          "Failed to create order"
      });
    }
  };

//UPDATE ORDER

exports.updateOrder =
  async(req,res)=>{

    try{

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