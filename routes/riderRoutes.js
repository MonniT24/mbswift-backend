const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const upload =
  require("../middleware/upload");

const cloudinary =
  require("../config/cloudinary");

const User =
  require("../models/User");

const {
  getMe,
  getAllRiders,
  updateRiderProfile
} = require(
  "../controllers/riderController"
);


router.get(

  "/me",

  authMiddleware,

  getMe
);


router.get(

  "/",

  authMiddleware,

  getAllRiders
);

router.put(

  "/profile",

  authMiddleware,

  updateRiderProfile
);

router.put(
  "/profile-image",
  authMiddleware,
  upload.single("profileImage"),
  async(req,res)=>{

    try{

      if(!req.file){

        return res.status(400).json({
          message:"No image uploaded"
        });
      }

      const result =
        await new Promise((resolve,reject)=>{

          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder:"monnidrop_rider_profiles"
              },
              (error,result)=>{

                if(error){

                  return reject(error);
                }

                resolve(result);
              }
            );

          stream.end(
            req.file.buffer
          );
        });

      const user =
        await User.findById(
          req.user._id
        );

      if(!user){

        return res.status(404).json({
          message:"Rider not found"
        });
      }

      user.profileImage =
        result.secure_url;

      await user.save();

      const updatedUser =
        await User.findById(
          req.user._id
        ).select("-password");

      res.json({
        message:"Rider profile image uploaded successfully",
        user:updatedUser
      });

    }catch(err){

      console.log(
        "RIDER IMAGE UPLOAD ERROR:",
        err
      );

      res.status(500).json({
        message:
          err.message ||
          "Rider image upload failed"
      });
    }
  }
);

router.put(
  "/status",
  authMiddleware,
  async(req,res)=>{

    try{

      const {
        status
      } = req.body;

      if(
        !["available","offline"].includes(status)
      ){

        return res.status(400).json({
          message:"Invalid rider status"
        });
      }

      const user =
        await User.findById(
          req.user._id
        ).select("-password");

      if(!user){

        return res.status(404).json({
          message:"Rider not found"
        });
      }

      if(user.role !== "rider"){

        return res.status(403).json({
          message:"Only riders can update status"
        });
      }

      user.status =
        status;

      await user.save();

      res.json({
        message:"Rider status updated successfully",
        user
      });

    }catch(err){

      console.log(
        "RIDER STATUS UPDATE ERROR:",
        err.message
      );

      res.status(500).json({
        message:"Failed to update rider status"
      });
    }
  }
);

module.exports =
  router;