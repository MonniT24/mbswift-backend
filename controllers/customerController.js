const Order =
  require("../models/Order");

const User =
  require("../models/User");

//CREATE ORDER

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

//GET CUSTOMER ORDERS

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

//GET LOGGED USER

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

  //UPDATE CUSTOMER PROFILE

exports.updateProfile =
  async (
    req,
    res
  ) => {

    try{

      const user =
        await User.findById(
          req.user._id
        );

      if(!user){

        return res.status(404).json({
          message:"User not found"
        });
      }

      user.name =
  req.body.name !== undefined
  ? req.body.name
  : user.name;

user.email =
  req.body.email !== undefined
  ? req.body.email
  : user.email;

user.phone =
  req.body.phone !== undefined
  ? req.body.phone
  : user.phone;

user.address =
  req.body.address !== undefined
  ? req.body.address
  : user.address;

user.dob =
  req.body.dob !== undefined
  ? req.body.dob
  : user.dob;

user.gender =
  req.body.gender !== undefined
  ? req.body.gender
  : user.gender;

user.emergencyContact =
  req.body.emergencyContact !== undefined
  ? req.body.emergencyContact
  : user.emergencyContact;

  console.log(
  "PROFILE UPDATE BODY:",
  req.body
);

      await user.save();

      console.log(
  "PROFILE SAVED USER:",
  user
);

      res.json({

        message:
          "Profile updated successfully",

        user

      });

    }catch(err){

      console.log(err);

      res.status(500).json({
        message:err.message
      });
    }
  };

  
//GET CUSTOMER SETTINGS

exports.getCustomerSettings =
  async (
    req,
    res
  ) => {

    try{

      const user =
        await User.findById(
          req.user._id
        ).select(
          "customerSettings"
        );

      if(!user){

        return res.status(404).json({
          message:"User not found"
        });
      }

      res.json({
        settings:
          user.customerSettings || {}
      });

    }catch(err){

      console.log(err);

      res.status(500).json({
        message:err.message
      });
    }
  };


//UPDATE CUSTOMER SETTINGS

exports.updateCustomerSettings =
  async (
    req,
    res
  ) => {

    try{

      const user =
        await User.findById(
          req.user._id
        );

      if(!user){

        return res.status(404).json({
          message:"User not found"
        });
      }

      user.customerSettings = {

        phoneNumber:
          req.body.phoneNumber !== undefined
          ? req.body.phoneNumber
          : user.customerSettings?.phoneNumber || "",

        email:
          req.body.email !== undefined
          ? req.body.email
          : user.customerSettings?.email || "",

        country:
          req.body.country !== undefined
          ? req.body.country
          : user.customerSettings?.country || "Ghana",

        language:
          req.body.language !== undefined
          ? req.body.language
          : user.customerSettings?.language || "English",

        currency:
          req.body.currency !== undefined
          ? req.body.currency
          : user.customerSettings?.currency || "GHS",

        paymentMethod:
          req.body.paymentMethod !== undefined
          ? req.body.paymentMethod
          : user.customerSettings?.paymentMethod || "",

        twoFactorEnabled:
          req.body.twoFactorEnabled !== undefined
          ? req.body.twoFactorEnabled
          : user.customerSettings?.twoFactorEnabled || false,

        googleConnected:
          req.body.googleConnected !== undefined
          ? req.body.googleConnected
          : user.customerSettings?.googleConnected || false,

        facebookConnected:
          req.body.facebookConnected !== undefined
          ? req.body.facebookConnected
          : user.customerSettings?.facebookConnected || false

      };

      await user.save();

      res.json({

        message:
          "Customer settings saved successfully",

        settings:
          user.customerSettings

      });

    }catch(err){

      console.log(err);

      res.status(500).json({
        message:err.message
      });
    }
  };