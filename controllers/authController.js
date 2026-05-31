const User =
  require("../models/User");

const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

  const {
  sendPhoneOtp,
  checkPhoneOtp
} = require("../utils/twilioVerify");

//REGISTER 

exports.register =
  async (
    req,
    res
  ) => {

    try{

      const {

     name,
     email,
     password,
    phone,
    gender,
    dob,
    role,
    phoneVerificationToken

} = req.body;

      const existing =
        await User.findOne({
          email
        });

      if(existing){

        return res.status(400).json({

          message:
            "User already exists"
        });
      }

      if(role === "customer"){

        if(!phone){

          return res.status(400).json({

            message:
              "Mobile number is required"
          });
        }

        if(!phoneVerificationToken){

          return res.status(400).json({

            message:
              "Please verify your mobile number first"
          });
        }

        try{

          const decoded =
            jwt.verify(
              phoneVerificationToken,
              process.env.PHONE_VERIFY_JWT_SECRET
            );

          if(decoded.phone !== phone){

            return res.status(400).json({

              message:
                "Verified phone number does not match"
            });
          }

        }catch(error){

          return res.status(400).json({

            message:
              "Phone verification expired. Please request OTP again"
          });
        }
      }

      const hashed =
        await bcrypt.hash(
          password,
          10
        );

      const user =
  await User.create({

    name,

    email,

    password:hashed,

    phone,

    gender,

    dob,

    phoneVerified:
      role === "customer"
        ? true
        : false,

    role
  });

      const token =
  jwt.sign(

    {

      _id:user._id,

      id:user._id,

      role:user.role
    },

    process.env.JWT_SECRET ||
    "secret",

    {
      expiresIn:"7d"
    }
  );

res.status(201).json({

  message:
    "Registered successfully",

  token,

  user:{

    _id:user._id,

    name:user.name,

    email:user.email,

    phone:user.phone,

    gender:user.gender,

    dob:user.dob,

    role:user.role,

   phoneVerified:user.phoneVerified,

profileCompleted:user.profileCompleted
  }
});

    }catch(err){

      console.log(err);

      res.status(500).json({

        message:
          err.message
      });
    }
  };
//LOGIN

exports.login =
  async (
    req,
    res
  ) => {

    try{

      const {
        email,
        password
      } = req.body;

      const user =
        await User.findOne({
          email
        });

      if(!user){

        return res.status(400).json({

          message:
            "Invalid credentials"
        });
      }

      const match =
        await bcrypt.compare(

          password,
          user.password
        );

      if(!match){

        return res.status(400).json({

          message:
            "Invalid credentials"
        });
      }

      // IMPORTANT FIX

      const token =
        jwt.sign(

          {

            _id:user._id,

            id:user._id,

            role:user.role
          },

          process.env.JWT_SECRET ||
          "secret",

          {
            expiresIn:"7d"
          }
        );

      res.json({

        token,

        user:{

          _id:user._id,

          name:user.name,

          email:user.email,

          phone:user.phone,

          role:user.role,

        status:user.status,

        gender:user.gender,

        dob:user.dob,

        phoneVerified:user.phoneVerified,

        profileCompleted:user.profileCompleted
        }
      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        message:
          err.message
      });
    }
  };

  exports.sendRegistrationOtp =
  async(req,res)=>{

    try{

      const { phone } =
        req.body;

      if(!phone){

        return res.status(400).json({
          message:"Mobile number is required"
        });
      }

      await sendPhoneOtp(
        phone
      );

      res.json({
        message:"OTP sent successfully"
      });

    }catch(error){

      console.log(
        "SEND OTP ERROR:",
        error.message
      );

      res.status(500).json({
        message:"Failed to send OTP"
      });
    }
  };

  exports.verifyRegistrationOtp =
  async(req,res)=>{

    try{

      const { phone, otp } =
        req.body;

      if(!phone || !otp){

        return res.status(400).json({
          message:"Phone number and OTP are required"
        });
      }

      const verification =
        await checkPhoneOtp(
          phone,
          otp
        );

      if(
        verification.status !== "approved"
      ){

        return res.status(400).json({
          message:"Invalid OTP"
        });
      }

      const phoneVerificationToken =
        jwt.sign(
          { phone },
          process.env.PHONE_VERIFY_JWT_SECRET,
          { expiresIn:"10m" }
        );

      res.json({
        message:"Phone number verified",
        phoneVerificationToken
      });

    }catch(error){

      console.log(
        "VERIFY OTP ERROR:",
        error.message
      );

      res.status(500).json({
        message:"OTP verification failed"
      });
    }
  };