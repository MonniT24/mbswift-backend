const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const User =
  require("../models/User");

  const RiderStatusHistory =
  require("../models/RiderStatusHistory");

const RiderRating =
  require("../models/RiderRating");

  const adminController =
  require("../controllers/adminController");

function checkAdmin(req,res,next){

  if(
    !req.user ||
    req.user.role !== "admin"
  ){

    return res.status(403)
    .json({
      message:"Admin access only"
    });
  }

  next();
}

function getStatusInfo(accountStatus){

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

  return statusInfo[accountStatus];
}

function removePassword(user){

  const cleanUser =
    user.toObject();

  delete cleanUser.password;

  return cleanUser;
}

async function sendRiderNotification(
  req,
  rider,
  notification,
  accountStatus
){

  const io =
    req.app.get("io");

  if(!io){
    return;
  }

  io.to(
    rider._id.toString()
  ).emit(
    "newNotification",
    notification
  );

  io.to(
    rider._id.toString()
  ).emit(
    "riderAccountStatusUpdated",
    {
      riderId:rider._id,
      accountStatus:accountStatus,
      status:rider.status,
      reason:rider.riderStatusReason
    }
  );

  io.emit(
    "riderStatusUpdated",
    {
      riderId:rider._id,
      accountStatus:accountStatus,
      status:rider.status
    }
  );
}

async function updateRiderStatus({
  req,
  res,
  riderId,
  accountStatus,
  reason,
  successMessage
}){

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
      riderId
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

  const statusInfo =
    getStatusInfo(
      accountStatus
    );

  if(!statusInfo){

    return res.status(400)
    .json({
      message:"Invalid rider status information"
    });
  }

  const cleanReason =
    reason.trim();

    const oldAccountStatus =
  rider.riderAccountStatus || "";

const oldWorkStatus =
  rider.status || "";

  const finalMessage =
    `${statusInfo.message}\n\nReason: ${cleanReason}`;

  rider.riderAccountStatus =
    accountStatus;

  rider.riderStatusReason =
    cleanReason;

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
    title:statusInfo.title,
    message:finalMessage,
    type:"rider_account_status",
    accountStatus:accountStatus,
    read:false,
    createdAt:new Date()
  };

  if(
    !Array.isArray(
      rider.notifications
    )
  ){

    rider.notifications = [];
  }

  rider.notifications.unshift(
    notification
  );

  rider.markModified(
    "notifications"
  );

  await rider.save();

  await RiderStatusHistory.create({

  rider:rider._id,

  admin:req.user?._id || null,

  accountStatus:accountStatus,

  previousStatus:oldAccountStatus || oldWorkStatus,

  newStatus:rider.status,

  reason:cleanReason,

  message:finalMessage
});

  await sendRiderNotification(
    req,
    rider,
    notification,
    accountStatus
  );

  return res.status(200)
  .json({
    message:successMessage,
    rider:removePassword(rider)
  });
}

router.put(
  "/riders/:riderId/account-status",
  authMiddleware,
  checkAdmin,
  async(req,res)=>{

    try{

      const {
        accountStatus,
        reason
      } = req.body;

      await updateRiderStatus({
        req,
        res,
        riderId:req.params.riderId,
        accountStatus,
        reason,
        successMessage:"Rider account status updated successfully"
      });

    }catch(err){

      console.log(
        "UPDATE RIDER ACCOUNT STATUS ERROR:",
        err
      );

      return res.status(500)
      .json({
        message:"Failed to update rider account status"
      });
    }
  }
);

router.put(
  "/riders/:id/suspend",
  authMiddleware,
  checkAdmin,
  async(req,res)=>{

    try{

      await updateRiderStatus({
        req,
        res,
        riderId:req.params.id,
        accountStatus:"temporary_suspended",
        reason:"Rider temporarily suspended by admin.",
        successMessage:"Rider suspended successfully"
      });

    }catch(err){

      console.log(
        "SUSPEND RIDER ERROR:",
        err
      );

      return res.status(500)
      .json({
        message:"Failed to suspend rider"
      });
    }
  }
);

router.put(
  "/riders/:id/unsuspend",
  authMiddleware,
  checkAdmin,
  async(req,res)=>{

    try{

      await updateRiderStatus({
        req,
        res,
        riderId:req.params.id,
        accountStatus:"reinstated",
        reason:"Rider reinstated by admin.",
        successMessage:"Rider reactivated successfully"
      });

    }catch(err){

      console.log(
        "UNSUSPEND RIDER ERROR:",
        err
      );

      return res.status(500)
      .json({
        message:"Failed to reactivate rider"
      });
    }
  }
);

router.get(
  "/rider-status-file",
  authMiddleware,
  checkAdmin,
  async(req,res)=>{

    try{

      const riders =
        await User.find({
          role:"rider"
        }).select(
          "-password"
        );

      const histories =
        await RiderStatusHistory.find({})
        .populate(
          "rider",
          "name phone email status riderAccountStatus"
        )
        .populate(
          "admin",
          "name email"
        )
        .sort({
          createdAt:-1
        });

      const ratings =
        await RiderRating.find({})
        .populate(
          "rider",
          "name phone email"
        )
        .populate(
          "customer",
          "name phone email"
        )
        .populate(
          "order",
          "pickupLocation dropoffLocation total status"
        )
        .sort({
          createdAt:-1
        });

      const riderFiles =
        riders.map((rider)=>{

          const riderId =
            rider._id.toString();

          const riderHistories =
            histories.filter((history)=>
              history.rider &&
              history.rider._id.toString() === riderId
            );

          const riderRatings =
            ratings.filter((rating)=>
              rating.rider &&
              rating.rider._id.toString() === riderId
            );

          const suspensionCount =
            riderHistories.filter((history)=>
              history.accountStatus === "temporary_suspended" ||
              history.accountStatus === "permanent_suspended"
            ).length;

          const reinstatedCount =
            riderHistories.filter((history)=>
              history.accountStatus === "reinstated"
            ).length;

          const totalRatings =
            riderRatings.length;

          const averageRating =
            totalRatings > 0
            ? Number(
                (
                  riderRatings.reduce(
                    (sum,item)=>
                      sum + Number(item.rating || 0),
                    0
                  ) / totalRatings
                ).toFixed(1)
              )
            : 0;

          let performanceCategory =
            "Not Rated Yet";

          if(
            averageRating >= 4.5 &&
            suspensionCount === 0
          ){

            performanceCategory =
              "Hardworking";
          }
          else if(
            averageRating >= 3 &&
            suspensionCount <= 1
          ){

            performanceCategory =
              "Average";
          }
          else if(
            totalRatings > 0 ||
            suspensionCount > 0
          ){

            performanceCategory =
              "Needs Attention";
          }

          return {
            rider:rider,
            currentAccountStatus:rider.riderAccountStatus || "active",
            currentWorkStatus:rider.status || "available",
            suspensionCount:suspensionCount,
            reinstatedCount:reinstatedCount,
            totalRatings:totalRatings,
            averageRating:averageRating,
            performanceCategory:performanceCategory,
            statusHistory:riderHistories,
            ratings:riderRatings
          };
        });

      res.status(200).json({
        totalRiders:riderFiles.length,
        riderFiles:riderFiles
      });

    }catch(err){

      console.log(
        "RIDER STATUS FILE ERROR:",
        err
      );

      res.status(500).json({
        message:"Failed to load rider status file"
      });
    }
  }
);

router.get(
  "/payment-records",
  authMiddleware,
  checkAdmin,
  adminController.getPaymentRecords
);

module.exports =
  router;