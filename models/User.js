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

motorNumber:{
  type:String,
  default:""
},

//RIDER STATUS

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