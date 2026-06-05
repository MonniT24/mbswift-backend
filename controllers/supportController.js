const SupportMessage =
  require("../models/SupportMessage");

const cloudinary =
  require("../config/cloudinary");

// CUSTOMER SENDS SUPPORT MESSAGE
exports.sendSupportMessage =
  async(req,res)=>{

    try{

      const { message } =
        req.body;

      if(!message && !req.file){

        return res.status(400).json({
          message:"Support message or image is required"
        });
      }

      const customerId =
        req.user.id || req.user._id;

      if(!customerId){

        return res.status(401).json({
          message:"User not authenticated"
        });
      }

      let imageUrl = "";

      if(req.file){

        const fileBase64 =
          req.file.buffer.toString("base64");

        const fileData =
          `data:${req.file.mimetype};base64,${fileBase64}`;

        const uploadedImage =
          await cloudinary.uploader.upload(
            fileData,
            {
              folder:"monnidrop/support"
            }
          );

        imageUrl =
          uploadedImage.secure_url;
      }

      let supportMessage =
        await SupportMessage.create({
          customer:customerId,
          message:message || "",
          image:imageUrl
        });

      supportMessage =
        await supportMessage.populate(
          "customer",
          "name email phone"
        );

      const io =
        req.app.get("io");

      if(io){

        io.emit(
          "supportMessageCreated",
          supportMessage
        );
      }

      res.status(201).json(
        supportMessage
      );

    }catch(error){

      console.log(
        "SUPPORT MESSAGE ERROR:",
        error
      );

      res.status(500).json({
        message:"Failed to send support message",
        error:error.message
      });
    }
  };

// ADMIN GETS ALL SUPPORT MESSAGES
exports.getSupportMessages =
  async(req,res)=>{

    try{

      const messages =
        await SupportMessage.find()
          .populate("customer","name email phone")
          .sort({ createdAt:-1 });

      res.json(messages);

    }catch(error){

      res.status(500).json({
        message:"Failed to fetch support messages",
        error:error.message
      });
    }
  };

// ADMIN REPLIES
exports.replySupportMessage =
  async(req,res)=>{

    try{

      const { reply } =
        req.body;

      let message =
        await SupportMessage.findByIdAndUpdate(
          req.params.id,
          {
            reply,
            status:"replied"
          },
          { new:true }
        ).populate(
          "customer",
          "name email phone"
        );

      const io =
        req.app.get("io");

      if(io){

        io.emit(
          "supportMessageReplied",
          message
        );
      }

      res.json(message);

    }catch(error){

      res.status(500).json({
        message:"Failed to reply support message",
        error:error.message
      });
    }
  };