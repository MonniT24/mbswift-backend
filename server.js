require("dotenv").config();

const express =
  require("express");

const mongoose =
  require("mongoose");

const cors =
  require("cors");

const dotenv =
  require("dotenv");

const http =
  require("http");

const { Server } =
  require("socket.io");


dotenv.config();



const app = express();


const server =
  http.createServer(app);


const io =
  new Server(server, {

    cors: {

      origin: "*",

      methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE"
      ]
    }
  });


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

        console.log(
          "Socket disconnected:",
          socket.id
        );
      }
    );
  }
);


app.set("io", io);


app.use(cors());

app.use(express.json());


const paymentRoutes =
  require("./routes/paymentRoutes");

const authRoutes =
  require("./routes/authRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const customerRoutes =
  require("./routes/customerRoutes");

const riderRoutes =
  require("./routes/riderRoutes");

const adminRoutes =
  require("./routes/adminRoutes");


app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/orders",
  orderRoutes
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
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);


app.get(
  "/",
  (req, res) => {

    res.send(
      "MonniDrop API Running"
    );
  }
);


app.get(
  "/api/test-route",
  (req, res) => {

    res.json({
      message: "Test route is working"
    });
  }
);


mongoose.connect(
  process.env.MONGO_URI
)

.then(() => {

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
})

.catch((err) => {

  console.log(
    "MongoDB connection error:"
  );

  console.log(err);
});