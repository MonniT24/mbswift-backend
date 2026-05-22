const mongoose =
  require("mongoose");

const riderStatusHistorySchema =
  new mongoose.Schema(
    {

      rider:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
      },

      admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
      },

      accountStatus:{
        type:String,
        enum:[
          "active",
          "temporary_suspended",
          "permanent_suspended",
          "reinstated"
        ],
        required:true
      },

      previousStatus:{
        type:String,
        default:""
      },

      newStatus:{
        type:String,
        default:""
      },

      reason:{
        type:String,
        required:true
      },

      message:{
        type:String,
        default:""
      }

    },
    {
      timestamps:true
    }
  );

module.exports =
  mongoose.model(
    "RiderStatusHistory",
    riderStatusHistorySchema
  );