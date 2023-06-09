const express = require("express");
const app = express();
const path = require("path");
const root_dir = __dirname.split("src")[0];
const cors = require("cors");
const connectDB = require("./utils/connectDB");
const morgan = require("morgan");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const notFoundMiddleware = require("./middleware/not-found");
const fileUpload = require("express-fileupload");
require("express-async-errors");
require("dotenv").config({ path: path.join(root_dir, `.env`) });
const cookieSession = require('cookie-session');
const crypto = require("crypto");


/**
 * ------------------------Session Setup
 */

// cors
const whitelist = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://127.0.0.1:5000",
  "http://localhost:5000/",
];

app.use(fileUpload({ createParentPath: true }));
const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      // for mobile app and postman client
      return callback(null, true);
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept",
};

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
// app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(express.json());
app.use(morgan("tiny"));


// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Generate a secure session secret
const sessionSecret = crypto.randomBytes(64).toString('hex');
app.use(
  cookieSession({
    name: "adordev-session",
    keys: [sessionSecret],
    httpOnly: true,
  })
);

/**
 * -------------------------View Engine
 */

// Set EJS as the view engine
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


/**
 * ------------------------routes
 */

// Routers
const userAuthRouter = require("./routers/user/authRoutes");


// home Route
app.get("/", (req, res) => {
  res.render('home');
});

// Use the userAuthRouter for the "/api/v1/user/auth" route
app.use("/api/v1/user/auth", userAuthRouter);


/**
 * ------------------------Error Handler
 */
// Error Handlers
app.use(notFoundMiddleware);
app.use(require("./middleware/errorHandler"));


/**
 * ------------------------Server
 */

const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server listening at http://127.0.0.1:${port}`);
    });
    console.log(process.env.NODE_ENV);
  } catch (error) {
    console.log("Something went wrong");
  }
};

start();
