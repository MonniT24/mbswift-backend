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

function createAuthToken(user){

  return jwt.sign(
    {
      _id:user._id,
      id:user._id,
      role:user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn:"7d"
    }
  );
}

function cleanUser(user){

  return {
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
  };
}

// REGISTER

exports.register =
  async(req,res)=>{

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
        await User.findOne({ email });

      if(existing){
        return res.status(400).json({
          message:"User already exists"
        });
      }

      if(role === "customer"){

        if(!phone){
          return res.status(400).json({
            message:"Mobile number is required"
          });
        }

        if(!phoneVerificationToken){
          return res.status(400).json({
            message:"Please verify your mobile number first"
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
              message:"Verified phone number does not match"
            });
          }

        }catch(error){

          return res.status(400).json({
            message:"Phone verification expired. Please request OTP again"
          });
        }
      }

      const hashed =
        await bcrypt.hash(password,10);

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
        createAuthToken(user);

      res.status(201).json({
        message:"Registered successfully",
        token,
        user:cleanUser(user)
      });

    }catch(err){

      console.log(err);

      res.status(500).json({
        message:err.message
      });
    }
  };

// LOGIN

exports.login =
  async(req,res)=>{

    try{

      const {
        email,
        password
      } = req.body;

      const user =
        await User.findOne({ email });

      if(!user){
        return res.status(400).json({
          message:"Invalid credentials"
        });
      }

      const match =
        await bcrypt.compare(
          password,
          user.password
        );

      if(!match){
        return res.status(400).json({
          message:"Invalid credentials"
        });
      }

      if(user.role === "admin"){

        if(!user.phone){
          return res.status(400).json({
            message:"Admin account has no phone number for 2FA"
          });
        }

        await sendPhoneOtp(user.phone);

        const adminLoginToken =
          jwt.sign(
            {
              userId:user._id,
              email:user.email,
              role:user.role
            },
            process.env.ADMIN_LOGIN_JWT_SECRET ||
            process.env.JWT_SECRET,
            {
              expiresIn:"10m"
            }
          );

        return res.json({
          requiresAdminOtp:true,
          message:"Admin OTP sent to your phone",
          adminLoginToken
        });
      }

      const token =
        createAuthToken(user);

      res.json({
        token,
        user:cleanUser(user)
      });

    }catch(err){

      console.log(
        "LOGIN ERROR:",
        err.message
      );

      res.status(500).json({
        message:err.message
      });
    }
  };

// VERIFY ADMIN LOGIN OTP

exports.verifyAdminLoginOtp =
  async(req,res)=>{

    try{

      const {
        adminLoginToken,
        otp
      } = req.body;

      if(!adminLoginToken || !otp){
        return res.status(400).json({
          message:"Admin login token and OTP are required"
        });
      }

      let decoded;

      try{

        decoded =
          jwt.verify(
            adminLoginToken,
            process.env.ADMIN_LOGIN_JWT_SECRET ||
            process.env.JWT_SECRET
          );

      }catch(error){

        return res.status(400).json({
          message:"Admin login session expired. Please login again"
        });
      }

      const user =
        await User.findById(decoded.userId);

      if(!user || user.role !== "admin"){
        return res.status(403).json({
          message:"Admin account not found"
        });
      }

      if(!user.phone){
        return res.status(400).json({
          message:"Admin account has no phone number"
        });
      }

      const verification =
        await checkPhoneOtp(
          user.phone,
          otp
        );

      if(verification.status !== "approved"){
        return res.status(400).json({
          message:"Invalid admin OTP"
        });
      }

      const token =
        createAuthToken(user);

      res.json({
        message:"Admin login verified",
        token,
        user:cleanUser(user)
      });

    }catch(error){

      console.log(
        "VERIFY ADMIN OTP ERROR:",
        error.message
      );

      res.status(500).json({
        message:"Admin OTP verification failed"
      });
    }
  };

// SEND REGISTRATION OTP

exports.sendRegistrationOtp =
  async(req,res)=>{

    try{

      const { phone } = req.body;

      if(!phone){
        return res.status(400).json({
          message:"Mobile number is required"
        });
      }

      await sendPhoneOtp(phone);

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

// VERIFY REGISTRATION OTP

exports.verifyRegistrationOtp =
  async(req,res)=>{

    try{

      const { phone, otp } = req.body;

      if(!phone || !otp){
        return res.status(400).json({
          message:"Phone number and OTP are required"
        });
      }

      const verification =
        await checkPhoneOtp(phone,otp);

      if(verification.status !== "approved"){
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

// SEND FORGOT PASSWORD OTP

exports.sendForgotPasswordOtp =
  async(req,res)=>{

    try{

      const { email } = req.body;

      if(!email){
        return res.status(400).json({
          message:"Email is required"
        });
      }

      const user =
        await User.findOne({ email });

      if(!user){
        return res.status(404).json({
          message:"No account found with this email"
        });
      }

      if(!user.phone){
        return res.status(400).json({
          message:"This account has no phone number"
        });
      }

      await sendPhoneOtp(user.phone);

      res.json({
        message:"OTP sent to your registered phone number"
      });

    }catch(error){

      console.log(
        "FORGOT PASSWORD SEND OTP ERROR:",
        error.message
      );

      res.status(500).json({
        message:"Failed to send reset OTP"
      });
    }
  };

// VERIFY FORGOT PASSWORD OTP

exports.verifyForgotPasswordOtp =
  async(req,res)=>{

    try{

      const { email, otp } = req.body;

      if(!email || !otp){
        return res.status(400).json({
          message:"Email and OTP are required"
        });
      }

      const user =
        await User.findOne({ email });

      if(!user){
        return res.status(404).json({
          message:"No account found with this email"
        });
      }

      if(!user.phone){
        return res.status(400).json({
          message:"This account has no phone number"
        });
      }

      const verification =
        await checkPhoneOtp(
          user.phone,
          otp
        );

      if(verification.status !== "approved"){
        return res.status(400).json({
          message:"Invalid OTP"
        });
      }

      const resetToken =
        jwt.sign(
          {
            userId:user._id,
            email:user.email
          },
          process.env.PASSWORD_RESET_JWT_SECRET ||
          process.env.JWT_SECRET,
          {
            expiresIn:"10m"
          }
        );

      res.json({
        message:"OTP verified successfully",
        resetToken
      });

    }catch(error){

      console.log(
        "FORGOT PASSWORD VERIFY OTP ERROR:",
        error.message
      );

      res.status(500).json({
        message:"OTP verification failed"
      });
    }
  };

// RESET PASSWORD

exports.resetPassword =
  async(req,res)=>{

    try{

      const {
        resetToken,
        newPassword
      } = req.body;

      if(!resetToken || !newPassword){
        return res.status(400).json({
          message:"Reset token and new password are required"
        });
      }

      if(newPassword.length < 6){
        return res.status(400).json({
          message:"Password must be at least 6 characters"
        });
      }

      let decoded;

      try{

        decoded =
          jwt.verify(
            resetToken,
            process.env.PASSWORD_RESET_JWT_SECRET ||
            process.env.JWT_SECRET
          );

      }catch(error){

        return res.status(400).json({
          message:"Reset session expired. Please request OTP again"
        });
      }

      const user =
        await User.findById(decoded.userId);

      if(!user){
        return res.status(404).json({
          message:"User not found"
        });
      }

      const hashedPassword =
        await bcrypt.hash(newPassword,10);

      user.password =
        hashedPassword;

      await user.save();

      res.json({
        message:"Password reset successfully"
      });

    }catch(error){

      console.log(
        "RESET PASSWORD ERROR:",
        error.message
      );

      res.status(500).json({
        message:"Password reset failed"
      });
    }
  };