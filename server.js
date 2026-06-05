require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");

const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(
  server,
  {
   cors: {
  origin: "*",
  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS"
  ],
  credentials: true
}
  }
);

app.set(
  "io",
  io
);

// ONLINE USERS STORAGE

const onlineUsers = new Map();

function sendOnlineUsers() {
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
  (socket) => {
    console.log(
      "Socket connected:",
      socket.id
    );

    socket.on(
      "joinUserRoom",
      (userId) => {
        if (!userId) {
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
      (data) => {
        if (
          !data?.userId ||
          !data?.role
        ) {
          return;
        }

        onlineUsers.set(
          socket.id,
          {
            socketId: socket.id,
            userId: String(data.userId),
            name: data.name || "Unknown",
            phone: data.phone || "N/A",
            role: data.role,
            connectedAt: new Date().toISOString()
          }
        );

        sendOnlineUsers();
      }
    );

    socket.on(
      "requestOnlineUsers",
      () => {
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
      (data) => {
        io.emit(
          "riderLocationUpdate",
          data
        );
      }
    );

    socket.on(
      "disconnect",
      () => {
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
  cors()
);

app.use(
  express.json()
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

app.use( "/api/auth",authRoutes);

app.use( "/api/orders", orderRoutes);

app.use("/api/support", supportRoutes);

app.use( "/api/customer",customerRoutes);

app.use( "/api/rider", riderRoutes);

app.use("/api/rider-status-histories", riderStatusHistoryRoutes);

app.use("/api/payments",paymentRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/ratings", ratingRoutes);

app.get(
  "/",
  (req, res) => {
    res.send(
      "MonniDrop API Running"
    );
  }
);

// DATABASE + SERVER

mongoose
  .connect(
    process.env.MONGO_URI
  )
  .then(
    () => {
      console.log(
        "MongoDB connected"
      );

      server.listen(
        process.env.PORT || 5000,
        () => {
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
    (err) => {
      console.log(
        "MongoDB connection error:"
      );

      console.log(
        err
      );
    }
  );