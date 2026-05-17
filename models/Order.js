const mongoose =
  require("mongoose");

const orderSchema =
  new mongoose.Schema(

    {

      // CUSTOMER

      customer:{

        type:
          mongoose.Schema.Types.ObjectId,

        ref:"User",

        required:true
      },

      // RIDER

      rider:{

        type:
          mongoose.Schema.Types.ObjectId,

        ref:"User",

        default:null
      },

      // LOCATIONS

      pickupLocation:{
        type:String,
        required:true
      },

      dropoffLocation:{
        type:String,
        required:true
      },

      // ITEMS

      items:[

        {

          description:{
            type:String
          }
        }
      ],

      // PRICE

      distance:{
        type:Number,
        default:0
      },

      total:{
        type:Number,
        default:0
      },

      // PAYMENT

paymentMethod:{

  type:String,

  enum:[
    "cash",
    "momo"
  ],

  required:true
},

momoNumber:{
  type:String,
  default:""
},

      // STATUS

      status:{

        type:String,

        enum:[

          "pending",
          "accepted",
          "picked",
          "delivering",
          "delivered",
          "cancelled"
        ],

        default:"pending"
      },

      // FRAUD / CANCEL MONITORING

      cancelCount:{
        type:Number,
        default:0
      },

      customerCancelCount:{
        type:Number,
        default:0
      },

      riderCancelCount:{
        type:Number,
        default:0
      },

      cancelReason:{
        type:String,
        default:""
      },

      cancelledBy:{

        type:String,

        enum:[
          "",
          "customer",
          "rider",
          "admin"
        ],

        default:""
      },

      flagged:{
        type:Boolean,
        default:false
      },

      // CHAT

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