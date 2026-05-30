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

      idType:{
      type:String,
     enum:[
    "Ghana Card",
    "Driver's License",
    "Passport",
    "Voter ID",
    "Other"
  ],
  default:""
},

idNumber:{
  type:String,
  trim:true,
  default:""
},

      dob:{
        type:String,
        default:""
      },

      address:{
        type:String,
        default:""
      },

      gender:{
        type:String,
        enum:[
          "",
          "Female",
          "Male",
          "Prefer not to say"
        ],
        default:""
      },

      emergencyContact:{
        type:String,
        default:""
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

      profileImage:{
        type:String,
        default:""
      },

      customerSettings:{

        phoneNumber:{
          type:String,
          default:""
        },

        email:{
          type:String,
          default:""
        },

        country:{
          type:String,
          default:"Ghana"
        },

        language:{
          type:String,
          default:"English"
        },

        currency:{
          type:String,
          default:"GHS"
        },

        paymentMethod:{
          type:String,
          default:""
        },

        twoFactorEnabled:{
          type:Boolean,
          default:false
        },

        googleConnected:{
          type:Boolean,
          default:false
        },

        facebookConnected:{
          type:Boolean,
          default:false
        }

      },

      motorNumber:{
        type:String,
        default:""
      },

      motorName:{
  type:String,
  default:""
},

     idType:{
  type:String,
  enum:[
    "Ghana Card",
    "Passport",
    "Voter ID",
    "Driver License"
  ],
  default:undefined
},

idNumber:{
  type:String,
  trim:true,
  default:""
},

      // RIDER LIVE WORK STATUS
      // available = can accept orders
      // busy = currently handling order
      // offline = not available
      // suspended = blocked from delivery actions

      status:{
        type:String,

        enum:[
          "available",
          "busy",
          "offline",
          "suspended"
        ],

        default:"available"
      },

      // RIDER ACCOUNT STATUS FOR ADMIN CONTROL
      // active = normal rider
      // temporary_suspended = rider can login but cannot accept orders
      // permanent_suspended = rider can login but remains blocked
      // reinstated = rider restored after suspension

      riderAccountStatus:{
        type:String,

        enum:[
          "active",
          "temporary_suspended",
          "permanent_suspended",
          "reinstated"
        ],

        default:"active"
      },

      riderStatusReason:{
        type:String,
        default:""
      },

      riderStatusMessage:{
        type:String,
        default:""
      },

      riderStatusUpdatedAt:{
        type:Date,
        default:null
      },

      // RIDER NOTIFICATION INBOX
      // This stores admin messages like suspension, reinstatement, warnings.

      notifications:[
        {
          title:{
            type:String,
            default:""
          },

          message:{
            type:String,
            default:""
          },

          type:{
            type:String,
            default:"system"
          },

          accountStatus:{
            type:String,

            enum:[
              "",
              "active",
              "temporary_suspended",
              "permanent_suspended",
              "reinstated"
            ],

            default:""
          },

          read:{
            type:Boolean,
            default:false
          },

          createdAt:{
            type:Date,
            default:Date.now
          }
        }
      ],

      // LIVE LOCATION

      latitude:{
        type:Number,
        default:0
      },

      longitude:{
        type:Number,
        default:0
      },

      // CURRENT ORDER

      currentOrder:{
        type:mongoose.Schema.Types.ObjectId,

        ref:"Order",

        default:null
      },

      // LAST ACTIVE

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