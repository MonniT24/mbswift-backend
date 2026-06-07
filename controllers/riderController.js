const User =
  require("../models/User");

// GET RIDER

exports.getMe =
  async (
    req,
    res
  ) => {

    try{

      const rider =
        await User.findById(
          req.user._id
        )

        .select(
          "-password"
        );

      if(!rider){

        return res.status(404).json({

          message:
            "Rider not found"
        });
      }

      res.json(
        rider
      );

    }catch(err){

      console.log(err);

      res.status(500).json({

        message:
          err.message
      });
    }
  };


// GET ALL RIDERS

exports.getAllRiders =
  async (
    req,
    res
  ) => {

    try{

      const riders =
        await User.find({

          role:"rider"
        })

        .select(
          "-password"
        )

        .populate(
          "currentOrder"
        );

      res.json(
        riders
      );

    }catch(err){

      console.log(err);

      res.status(500).json({

        message:
          err.message
      });
    }
  };


// UPDATE RIDER PROFILE

exports.updateRiderProfile =
  async (
    req,
    res
  ) => {

    try{

      console.log(
        "RIDER PROFILE BODY:",
        req.body
      );

      const rider =
        await User.findById(
          req.user._id
        );

      if(!rider){

        return res.status(404).json({
          message:"Rider not found"
        });
      }

      rider.dob =
        req.body.dob !== undefined
        ? req.body.dob
        : rider.dob;

      rider.emergencyContact =
        req.body.emergencyContact !== undefined
        ? req.body.emergencyContact
        : rider.emergencyContact;

      rider.motorNumber =
        req.body.motorNumber !== undefined
        ? req.body.motorNumber
        : rider.motorNumber;

      rider.motorName =
        req.body.motorName !== undefined
        ? req.body.motorName
        : rider.motorName;

      rider.motorColor =
        req.body.motorColor !== undefined
        ? req.body.motorColor
        : rider.motorColor;

      rider.idType =
        req.body.idType !== undefined
        ? req.body.idType
        : rider.idType;

      rider.idNumber =
        req.body.idNumber !== undefined
        ? req.body.idNumber
        : rider.idNumber;

      await rider.save();

      const updatedRider =
        await User.findById(
          req.user._id
        ).select("-password");

      res.json({
        message:"Rider profile updated successfully",
        user:updatedRider
      });

    }catch(err){

      console.log(
        "UPDATE RIDER PROFILE ERROR:",
        err
      );

      res.status(500).json({
        message:err.message
      });
    }
  };