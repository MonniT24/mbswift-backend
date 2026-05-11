const User =
  require("../models/User");

const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

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
        role

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

          role
        });

      res.status(201).json({

        message:
          "Registered successfully"
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

          status:user.status
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