const User =
  require("../models/User");

  const Order =
  require("../models/Order");

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

  exports.getPaymentRecords =
  async(req,res)=>{

    try{

      const orders =
        await Order.find({
          status:"delivered"
        })

        .populate(
          "customer",
          "name phone email"
        )

        .populate(
          "rider",
          "name phone email"
        )

        .sort({
          deliveredAt:-1,
          createdAt:-1
        });

      const records =
        orders.map((order)=>{

          return {
            orderId:order._id,
            customer:{
              name:order.customer?.name || "Unknown Customer",
              phone:order.customer?.phone || "N/A",
              email:order.customer?.email || "N/A"
            },
            rider:{
              name:order.rider?.name || "Unassigned Rider",
              phone:order.rider?.phone || "N/A",
              email:order.rider?.email || "N/A"
            },
            pickupLocation:order.pickupLocation,
            dropoffLocation:order.dropoffLocation,
            paymentMethod:order.paymentMethod,
            isPaid:order.isPaid,
            paidAt:order.paidAt,
            cashCollectedByRider:order.cashCollectedByRider || false,
            cashCollectedAt:order.cashCollectedAt || null,
            amount:order.total || 0,
            status:order.status,
            deliveredAt:order.deliveredAt,
            createdAt:order.createdAt
          };
        });

      res.json(
        records
      );

    }catch(err){

      console.log(err);

      res.status(500)
      .json({
        message:err.message
      });
    }
  };

  exports.markCashAsSettled =
  async(req,res)=>{

    try{

      const {
        note
      } = req.body;

      const order =
        await Order.findById(
          req.params.orderId
        );

      if(!order){

        return res.status(404)
        .json({
          message:"Order not found"
        });
      }

      if(
        order.paymentMethod !== "cash"
      ){

        return res.status(400)
        .json({
          message:"This is not a cash order"
        });
      }

      if(
        order.cashCollectedByRider !== true
      ){

        return res.status(400)
        .json({
          message:"Rider has not collected cash yet"
        });
      }

      order.cashSettledToAdmin =
        true;

      order.cashSettledAt =
        new Date();

      order.cashSettledBy =
        req.user._id;

      order.cashSettlementNote =
        note || "";

      await order.save();

      res.json({
        message:"Cash marked as settled successfully",
        order
      });

    }catch(err){

      console.log(err);

      res.status(500)
      .json({
        message:err.message
      });
    }
  };