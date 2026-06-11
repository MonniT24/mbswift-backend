const mongoose =
  require("mongoose");

const bcrypt =
  require("bcryptjs");

require("dotenv").config();

const User =
  require("../models/User");

async function createAdmin(){

  try{

    const [
      ,
      ,
      name,
      email,
      phone,
      password
    ] = process.argv;

    if(
      !name ||
      !email ||
      !phone ||
      !password
    ){

      console.log(
        `
Usage:

node scripts/createAdmin.js "MB Swift Admin" admin@mbswift.com +233244095101 AdminPassword123
        `
      );

      process.exit(1);
    }

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected"
    );

    const existingUser =
      await User.findOne({
        $or:[
          { email },
          { phone }
        ]
      });

    if(existingUser){

      console.log(
        "Admin already exists with this email or phone"
      );

      process.exit(0);
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const admin =
      await User.create({

        name,

        email,

        phone,

        password:
          hashedPassword,

        role:"admin",

        phoneVerified:true,

        profileCompleted:true
      });

    console.log(
      "Admin created successfully"
    );

    console.log(
      admin.name
    );

    process.exit(0);

  }catch(error){

    console.log(
      "CREATE ADMIN ERROR:",
      error.message
    );

    process.exit(1);
  }
}

createAdmin();