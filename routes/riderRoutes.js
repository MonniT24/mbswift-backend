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

module.exports =
  router;