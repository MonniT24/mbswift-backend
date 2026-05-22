const mongoose =
  require("mongoose");

const riderRatingSchema =
  new mongoose.Schema(
    {

      order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        required:true,
        unique:true
      },

      rider:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
      },

      customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
      },

      rating:{
        type:Number,
        required:true,
        min:1,
        max:5
      },

      comment:{
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
    "RiderRating",
    riderRatingSchema
  );