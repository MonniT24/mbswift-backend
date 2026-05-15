const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

  const upload =
  require("../middleware/upload");

const User =
  require("../models/User");

const {

  createOrder,
  getMyOrders,
  getMe,
  updateProfile

} = require(
  "../controllers/customerController"
);

//GET LOGGED USER

router.get(
  "/me",
  authMiddleware,
  getMe
);

//GET CUSTOMER ORDERS

router.get(
  "/orders",
  authMiddleware,
  getMyOrders
);

//UPDATE CUSTOMER PROFILE

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

//CREATE ORDER

router.post(
  "/orders",
  authMiddleware,
  createOrder
);

router.put(
  "/profile-image",
  authMiddleware,
  upload.single("profileImage"),
  async(req,res)=>{

    try{

      if(!req.file){

        return res.status(400)
        .json({
          message:"No image uploaded"
        });
      }

      const cloudinary =
        require("../config/cloudinary");

      const result =
        await new Promise((resolve,reject)=>{

          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder:"monnidrop_profiles"
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
        await User.findByIdAndUpdate(
          req.user._id,
          {
            profileImage:result.secure_url
          },
          {
            new:true
          }
        ).select("-password");

      res.json({
        message:"Profile image uploaded successfully",
        user:user
      });

    }catch(err){

      console.log(
        "IMAGE UPLOAD ERROR:",
        err
      );

      res.status(500)
      .json({
        message:
          err.message ||
          "Image upload failed"
      });
    }
  }
);

module.exports =
  router;