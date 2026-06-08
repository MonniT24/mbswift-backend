require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");

const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const allowedOrigins = [
  "https://monnit24.onrender.com",
  "https://www.mbswiftgh.com",
  "http://localhost:3000"
];

const corsOptions = {
  origin:function(origin,callback){

    if(!origin){
      return callback(null,true);
    }

    if(allowedOrigins.includes(origin)){
      return callback(null,true);
    }

    return callback(
      new Error("Not allowed by CORS")
    );
  },
  credentials:true
};

const io = new Server(
  server,
  {
    cors:{
      origin:allowedOrigins,
      methods:[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "OPTIONS"
      ],
      credentials:true
    }
  }
);

app.set(
  "io",
  io
);

// ONLINE USERS STORAGE

const onlineUsers = new Map();

function sendOnlineUsers(){

  io.emit(
    "onlineUsersUpdate",
    Array.from(
      onlineUsers.values()
    )
  );
}

// SOCKET CONNECTION

io.on(
  "connection",
  (socket)=>{

    console.log(
      "Socket connected:",
      socket.id
    );

    socket.on(
      "joinUserRoom",
      (userId)=>{

        if(!userId){
          return;
        }

        socket.join(
          userId.toString()
        );

        console.log(
          "User joined room:",
          userId
        );
      }
    );

    socket.on(
      "userOnline",
      (data)=>{

        if(
          !data?.userId ||
          !data?.role
        ){
          return;
        }

        onlineUsers.set(
          socket.id,
          {
            socketId:socket.id,
            userId:String(data.userId),
            name:data.name || "Unknown",
            phone:data.phone || "N/A",
            role:data.role,
            connectedAt:new Date().toISOString()
          }
        );

        sendOnlineUsers();
      }
    );

    socket.on(
      "requestOnlineUsers",
      ()=>{

        socket.emit(
          "onlineUsersUpdate",
          Array.from(
            onlineUsers.values()
          )
        );
      }
    );

    socket.on(
      "riderLocation",
      (data)=>{

        io.emit(
          "riderLocationUpdate",
          data
        );
      }
    );

    socket.on(
      "disconnect",
      ()=>{

        onlineUsers.delete(
          socket.id
        );

        sendOnlineUsers();

        console.log(
          "Socket disconnected:",
          socket.id
        );
      }
    );
  }
);

// MIDDLEWARE

app.use(
  helmet()
);

app.use(
  cors(corsOptions)
);

app.use(
  express.json({
    limit:"2mb"
  })
);

const authLimiter =
  rateLimit({
    windowMs:15 * 60 * 1000,
    max:20,
    standardHeaders:true,
    legacyHeaders:false,
    message:{
      message:"Too many attempts. Please try again later."
    }
  });

app.use(
  "/api/auth/login",
  authLimiter
);

app.use(
  "/api/auth/send-registration-otp",
  authLimiter
);

app.use(
  "/api/auth/verify-registration-otp",
  authLimiter
);

app.use(
  "/api/auth/forgot-password-send-otp",
  authLimiter
);

app.use(
  "/api/auth/forgot-password-verify-otp",
  authLimiter
);

app.use(
  "/api/auth/reset-password",
  authLimiter
);

app.use(
  "/uploads",
  express.static("uploads")
);

// ROUTES IMPORTS

const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const supportRoutes = require("./routes/supportRoutes");
const customerRoutes = require("./routes/customerRoutes");
const riderRoutes = require("./routes/riderRoutes");
const riderStatusHistoryRoutes = require("./routes/riderStatusHistoryRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

// ROUTES USE

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/support",
  supportRoutes
);

app.use(
  "/api/customer",
  customerRoutes
);

app.use(
  "/api/rider",
  riderRoutes
);

app.use(
  "/api/rider-status-histories",
  riderStatusHistoryRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/ratings",
  ratingRoutes
);

app.get(
  "/",
  (req,res)=>{

    res.send(
      "MB SWIFT API Running..."
    );
  }
);

// DATABASE + SERVER

mongoose
  .connect(
    process.env.MONGO_URI
  )
  .then(
    ()=>{

      console.log(
        "MongoDB connected"
      );

      server.listen(
        process.env.PORT || 5000,
        ()=>{

          console.log(
            `Server running on port ${
              process.env.PORT || 5000
            }`
          );
        }
      );
    }
  )
  .catch(
    (err)=>{

      console.log(
        "MongoDB connection error:"
      );

      console.log(
        err
      );
    }
  );