const express =
  require("express");

const OpenAI =
  require("openai");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();

const openai =
  new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
  });

router.post(
  "/ask",
  authMiddleware,
  async(req,res)=>{

    try{

      const {
        message
      } = req.body;

      if(!message){

        return res.status(400).json({
          message:"Message is required"
        });
      }

      const response =
        await openai.responses.create({
          model:"gpt-4.1-mini",
          input:[
            {
              role:"system",
              content:
                "You are MB Swift Assistant. Answer customers clearly and briefly about delivery orders, riders, payments, cancellation, OTP delivery code, refunds, support, tracking, and account help. If the question is not about MB Swift or delivery support, politely say you can only help with MB Swift delivery matters."
            },
            {
              role:"user",
              content:message
            }
          ]
        });

      res.json({
        reply:
          response.output_text ||
          "Sorry, I could not answer that."
      });

    }catch(err){

      console.log(
        "CHATBOT FULL ERROR:"
      );

      console.log(err);

      res.status(500).json({
        message:
          err.message ||
          "Chatbot failed to respond"
      });
    }
  }
);

module.exports =
  router;