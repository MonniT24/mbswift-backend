const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const User =
  require("../models/User");

router.put(
  "/riders/:id/suspend",
  authMiddleware,
  async(req,res)=>{

    try{

      if(req.user.role !== "admin"){

        return res.status(403).json({
          message:"Admin access only"
        });
      }

      const rider =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            status:"suspended"
          },
          {
            new:true
          }
        ).select("-password");

      if(!rider){

        return res.status(404).json({
          message:"Rider not found"
        });
      }

      res.json({
        message:"Rider suspended successfully",
        rider:rider
      });

    }catch(err){

      console.log(err);

      res.status(500).json({
        message:"Failed to suspend rider"
      });
    }
  }
);

router.put(
  "/riders/:id/unsuspend",
  authMiddleware,
  async(req,res)=>{

    try{

      if(req.user.role !== "admin"){

        return res.status(403).json({
          message:"Admin access only"
        });
      }

      const rider =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            status:"available"
          },
          {
            new:true
          }
        ).select("-password");

      if(!rider){

        return res.status(404).json({
          message:"Rider not found"
        });
      }

      res.json({
        message:"Rider reactivated successfully",
        rider:rider
      });

    }catch(err){

      console.log(err);

      res.status(500).json({
        message:"Failed to reactivate rider"
      });
    }
  }
);

module.exports =
  router;