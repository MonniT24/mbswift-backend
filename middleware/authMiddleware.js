const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

module.exports =
  async (
    req,
    res,
    next
  ) => {

    try{

      const authHeader =
        req.header(
          "Authorization"
        );

      if(!authHeader){

        return res.status(401).json({

          message:
            "No token provided"
        });
      }

      const token =
        authHeader.replace(
          "Bearer ",
          ""
        );

      const decoded =
        jwt.verify(

          token,

          process.env.JWT_SECRET ||
          "secret"
        );

      // ================= GET FULL USER =================

      const user =
        await User.findById(

          decoded.id ||

          decoded._id
        )

        .select(
          "-password"
        );

      if(!user){

        return res.status(401).json({

          message:
            "User not found"
        });
      }

      // IMPORTANT

      req.user = {

        _id:user._id,

        name:user.name,

        email:user.email,

        role:user.role,

        phone:user.phone,

        status:user.status
      };

      next();

    }catch(err){

      console.log(err);

      res.status(401).json({

        message:
          "Invalid token"
      });
    }
  };