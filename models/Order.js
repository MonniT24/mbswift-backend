const mongoose =
  require("mongoose");

const orderSchema =
  new mongoose.Schema(

    {

      // ================= CUSTOMER =================

      customer:{

        type:
          mongoose.Schema.Types.ObjectId,

        ref:"User",

        required:true
      },

      // ================= RIDER =================

      rider:{

        type:
          mongoose.Schema.Types.ObjectId,

        ref:"User",

        default:null
      },

      // ================= LOCATIONS =================

      pickupLocation:{
        type:String,
        required:true
      },

      dropoffLocation:{
        type:String,
        required:true
      },

      // ================= ITEMS =================

      items:[

        {

          description:{
            type:String
          }
        }
      ],

      // ================= PRICE =================

      distance:{
        type:Number,
        default:0
      },

      total:{
        type:Number,
        default:0
      },

      // ================= STATUS =================

      status:{

        type:String,

        enum:[

          "pending",
          "assigned",
          "picked",
          "delivering",
          "delivered",
          "cancelled"
        ],

        default:"pending"
      },

      // ================= CHAT =================

      messages:[

        {

          sender:{
            type:String
          },

          text:{
            type:String
          },

          createdAt:{
            type:Date,
            default:Date.now
          }
        }
      ]
    },

    {
      timestamps:true
    }
  );

module.exports =
  mongoose.model(
    "Order",
    orderSchema
  );