const mongoose =
  require("mongoose");

const userSchema =
  new mongoose.Schema(

    {

      name:{
        type:String,
        required:true
      },

      email:{
        type:String,
        required:true,
        unique:true
      },

      phone:{
        type:String,
        required:true
      },

      password:{
        type:String,
        required:true
      },

      role:{
        type:String,

        enum:[
          "customer",
          "rider",
          "admin"
        ],

        default:"customer"
      },

      //RIDER STATUS

      status:{
        type:String,

        enum:[
          "available",
          "busy",
          "offline"
        ],

        default:"available"
      },

      //LIVE LOCATION

      latitude:{
        type:Number,
        default:0
      },

      longitude:{
        type:Number,
        default:0
      },

      //CURRENT ORDER

      currentOrder:{
        type:mongoose.Schema.Types.ObjectId,

        ref:"Order",

        default:null
      },

      //LAST ACTIVE

      lastSeen:{
        type:Date,
        default:Date.now
      }

    },

    {
      timestamps:true
    }
  );

module.exports =
  mongoose.model(
    "User",
    userSchema
  );