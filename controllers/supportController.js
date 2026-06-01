const SupportMessage =
  require("../models/SupportMessage");

// CUSTOMER SENDS SUPPORT MESSAGE
exports.sendSupportMessage =
  async(req,res)=>{

    try{

      const { message } = req.body;

      if(!message){

        return res.status(400).json({
          message:"Support message is required"
        });
      }

      const supportMessage =
        await SupportMessage.create({
          customer:req.user.id,
          message
        });

      res.status(201).json(
        supportMessage
      );

    }catch(error){

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

      const { reply } = req.body;

      const message =
        await SupportMessage.findByIdAndUpdate(
          req.params.id,
          {
            reply,
            status:"replied"
          },
          { new:true }
        );

      res.json(message);

    }catch(error){

      res.status(500).json({
        message:"Failed to reply support message",
        error:error.message
      });
    }
  };