const User =
  require("../models/User");

exports.updateRiderAccountStatus =
  async(req,res)=>{

    try{

      const {
        accountStatus,
        reason
      } = req.body;

      const validStatuses = [
        "active",
        "temporary_suspended",
        "permanent_suspended",
        "reinstated"
      ];

      if(
        !validStatuses.includes(accountStatus)
      ){

        return res.status(400)
        .json({
          message:"Invalid rider account status"
        });
      }

      if(
        !reason ||
        reason.trim() === ""
      ){

        return res.status(400)
        .json({
          message:"Reason is required"
        });
      }

      const rider =
        await User.findById(
          req.params.riderId
        );

      if(!rider){

        return res.status(404)
        .json({
          message:"Rider not found"
        });
      }

      if(rider.role !== "rider"){

        return res.status(400)
        .json({
          message:"This user is not a rider"
        });
      }

      const statusInfo = {
        active:{
          title:"✅ Active Rider",
          message:
            "Your rider account is active. You can receive and manage delivery orders."
        },

        temporary_suspended:{
          title:"⏳ Temporary Suspension",
          message:
            "Your rider account has been temporarily suspended. You can login, but you cannot view or accept delivery orders at this time."
        },

        permanent_suspended:{
          title:"⛔ Permanent Suspension",
          message:
            "Your rider account has been permanently suspended. You can login, but you cannot view or accept delivery orders."
        },

        reinstated:{
          title:"🔄 Account Reinstated",
          message:
            "Your rider account has been reinstated. You can now receive and manage delivery orders again."
        }
      };

      const finalMessage =
        `${statusInfo[accountStatus].message}\n\nReason: ${reason.trim()}`;

      rider.riderAccountStatus =
        accountStatus;

      rider.riderStatusReason =
        reason.trim();

      rider.riderStatusMessage =
        finalMessage;

      rider.riderStatusUpdatedAt =
        new Date();

      if(
        accountStatus === "temporary_suspended" ||
        accountStatus === "permanent_suspended"
      ){

        rider.status =
          "suspended";

        rider.currentOrder =
          null;
      }

      if(
        accountStatus === "active" ||
        accountStatus === "reinstated"
      ){

        rider.status =
          "available";
      }

      const notification = {
        title:statusInfo[accountStatus].title,
        message:finalMessage,
        type:"rider_account_status",
        read:false,
        createdAt:new Date()
      };

      rider.notifications.unshift(
        notification
      );

      await rider.save();

      const io =
        req.app.get("io");

      if(io){

        io.to(
          rider._id.toString()
        ).emit(
          "newNotification",
          notification
        );

        io.emit(
          "riderStatusUpdated",
          {
            riderId:rider._id,
            accountStatus,
            status:rider.status
          }
        );
      }

      res.json({
        message:"Rider account status updated successfully",
        rider
      });

    }catch(err){

      console.log(err);

      res.status(500)
      .json({
        message:err.message
      });
    }
  };