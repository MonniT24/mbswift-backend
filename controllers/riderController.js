const User =
  require("../models/User");

//GET RIDER

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

  //UPDATE RIDER PROFILE

exports.updateRiderProfile =
  async (
    req,
    res
  ) => {

    try{

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
        req.body.dob ||
        rider.dob;

      rider.emergencyContact =
      req.body.emergencyContact ||
      rider.emergencyContact;

     rider.motorNumber =
     req.body.motorNumber ||
     rider.motorNumber;

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

      console.log(err);

      res.status(500).json({
        message:err.message
      });
    }
  };