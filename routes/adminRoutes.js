const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const User =
  require("../models/User");

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

module.exports =
  router;