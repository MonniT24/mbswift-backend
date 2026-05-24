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
            type:String,
            default:""
          }
        }
      ],

      // PRICE / DELIVERY INFO

      distance:{
        type:Number,
        default:0
      },

      deliveryTime:{
        type:String,
        default:""
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

      isPaid:{
        type:Boolean,
        default:false
      },

      paidAt:{
        type:Date,
        default:null
      },

      cashCollectedByRider:{
  type:Boolean,
  default:false
},

cashCollectedAt:{
  type:Date,
  default:null
},

cashSettledToAdmin:{
  type:Boolean,
  default:false
},

cashSettledAt:{
  type:Date,
  default:null
},

cashSettledBy:{
  type:
    mongoose.Schema.Types.ObjectId,

  ref:"User",

  default:null
},

cashSettlementNote:{
  type:String,
  default:""
},

      paymentResult:{

        reference:{
          type:String,
          default:""
        },

        status:{
          type:String,
          default:""
        },

        channel:{
          type:String,
          default:""
        },

        amount:{
          type:Number,
          default:0
        },

        currency:{
          type:String,
          default:""
        }
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

      // DELIVERY VERIFICATION CODE

      deliveryCode:{
        type:String,
        default:null
      },

      deliveryCodeVerified:{
        type:Boolean,
        default:false
      },

      deliveredAt:{
        type:Date,
        default:null
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
            type:String,
            default:""
          },

          text:{
            type:String,
            default:""
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