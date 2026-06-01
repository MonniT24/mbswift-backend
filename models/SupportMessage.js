const mongoose = require("mongoose");

const supportMessageSchema =
  new mongoose.Schema(
    {
      customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
      },

      message:{
        type:String,
        required:true
      },

      reply:{
        type:String,
        default:""
      },

      status:{
        type:String,
        default:"open"
      }
    },
    {
      timestamps:true
    }
  );

module.exports =
  mongoose.model(
    "SupportMessage",
    supportMessageSchema
  );