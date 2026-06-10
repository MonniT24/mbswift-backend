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
        trim:true,
        lowercase:true,
        default:""
      },

      phone:{
        type:String,
        trim:true,
        default:""
      },

      phoneVerified:{
        type:Boolean,
        default:false
      },

      profileCompleted:{
        type:Boolean,
        default:false
      },

      dob:{
        type:String,
        default:""
      },

      gender:{
        type:String,
        enum:[
          "",
          "Female",
          "Male",
          "Other",
          "Prefer not to say"
        ],
        default:""
      },

      address:{
        type:String,
        default:""
      },

      emergencyContact:{
        type:String,
        default:""
      },

      emergencyContactName:{
        type:String,
        default:""
      },

      emergencyContactPhone:{
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

      profilePhoto:{
        type:String,
        default:""
      },

      idType:{
        type:String,
        enum:[
          "",
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

      ghanaCardNumber:{
        type:String,
        trim:true,
        default:""
      },

      ghanaCardImage:{
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

      motorColor:{
        type:String,
        default:""
      },

      riderApprovalStatus:{
        type:String,
        enum:[
          "pending",
          "approved",
          "rejected"
        ],
        default:"pending"
      },

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

      latitude:{
        type:Number,
        default:0
      },

      longitude:{
        type:Number,
        default:0
      },

      currentOrder:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        default:null
      },

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