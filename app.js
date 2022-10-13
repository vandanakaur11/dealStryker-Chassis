require("dotenv").config();
const fs = require("fs");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
var session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const errorHandler = require("errorhandler");
const compression = require("compression");
const sslRedirect = require("heroku-ssl-redirect").default;

// Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

console.log("process.env.NODE_ENV >>>>>>>>>>>", process.env.NODE_ENV);

// Configure isProduction variable
const isProduction = process.env.NODE_ENV === "production";
// Configure port var
const PORT = process.env.PORT || 5000;

// Initiate our app
const app = express();

const rateLimit = require("express-rate-limit"); // API throttling setup
app.enable("trust proxy"); // for Heroku

var limitErrorMessage = "Too many requests, please limit use";

const apiLimiter = rateLimit({
    // Limiter for /login
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 10, // start blocking after 10 requests
    message: limitErrorMessage,
});

const createAccountLimiter = rateLimit({
    // General Limiter for everything else
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 200, // start blocking after 200 requests
    message: limitErrorMessage,
});

// app.use(sslRedirect(['production'], 301));

app.use((req, res, next) => {
    // for redirects since sslRedirect is sometimes picky -Bradley
    if (req.secure || !isProduction) {
        next();
    } else {
        res.redirect("https://" + req.headers.host + req.url);
    }
});

const liveBidsServer = require("http").createServer(app);
var http = require("http").Server(app);

// Configure our app
app.use(compression()); // all APP Funcs after this!
app.use((req, res, next) => {
    res.header("Cache-Control", "max-age=31536000");
    next();
});
const cacheRefresh = process.env.cacheTime; // or 31536000; // 31536000 = 8.76 ish hours

app.use(cors());
app.use(require("morgan")("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
    // Allowing Cors
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(
    fileUpload({
        abortOnLimit: true,
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
    }),
);

// Configure Mongoose
if (!isProduction) {
    console.log("====================================");
    console.log("databse for developmet");
    console.log("====================================");
    // if not prod
    app.use(errorHandler());
    // mongoose.connect("mongodb://localhost/dealstryker", {
    // useNewUrlParser: true,
    // })
    // .then(() => console.log("Database connected!"))
    // .catch(err => console.log(err));
    mongoose.connect(
        // below is testing database
        // "mongodb+srv://DealStryker:4rDlX5UcVur9K0f2@dealstryker-ieho9.mongodb.net/test?retryWrites=true&w=majority",
        "mongodb+srv://admin123:NNWeQBIR3yRKGR27@cluster0.zw2y3yp.mongodb.net/test?retryWrites=true&w=majority",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    );
    mongoose.set("debug", false);

    app.use(
        session({
            // Sessions using MongoStore
            secret: "Mqw5RAWF^+6VGgme",
            saveUninitialized: false, // don't create session until something stored
            resave: false, // don't save session if unmodified
            store: MongoStore.create({
                // mongoUrl: "mongodb+srv://DealStryker:4rDlX5UcVur9K0f2@dealstryker-ieho9.mongodb.net/test?retryWrites=true&w=majority",
                mongoUrl: "mongodb+srv://admin123:NNWeQBIR3yRKGR27@cluster0.zw2y3yp.mongodb.net/test?retryWrites=true&w=majority",
                touchAfter: 24 * 3600, // time period in seconds
                autoRemove: "native", // Default,
                ttl: 14 * 24 * 60 * 60, // 14 days. Default
                collectionName: "sessions",
            }),
        }),
    );
} else {
    // if prod
    mongoose.connect(process.env.MongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    mongoose.set("debug", false);

    app.use(
        session({
            // Sessions using MongoStore
            secret: "Mqw5RAWF^+6VGgme",
            saveUninitialized: false, // don't create session until something stored
            resave: false, // don't save session if unmodified
            store: MongoStore.create({
                mongoUrl: process.env.MongoDB,
                touchAfter: 24 * 3600, // time period in seconds
                autoRemove: "native", // Default,
                ttl: 14 * 24 * 60 * 60, // 14 days. Default
                collectionName: "sessions",
            }),
        }),
    );
}

// Models & routes
require("./models/Users");
require("./models/Bid");
require("./models/PotentialBuyer");
require("./models/Channel");

require("./config/passport");

app.use("/registerCustomer", apiLimiter); // API limiter to prevent spam sign ups
app.use("/registerDealer", apiLimiter); // API limiter to prevent spam sign ups
app.use(require("./routes"));

// Error handlers & middlewares
app.use((err, req, res, next) => {
    res.status(err.status || 500);

    res.json({
        errors: {
            message: err.message,
            error: {},
        },
    });
});

// Socket.io
const LiveBids = require("./LiveBids");
const io = (module.exports.ioLiveBids = require("socket.io")(liveBidsServer, http, {
    destroyUpgrade: false,
    allowEIO3: true,
    perMessageDeflate: false,
}));

io.on("connection", LiveBids);

// UI
app.use(express.static(path.join(__dirname, "client/build")));

// S3 setup
// var sign_s3 = require('./routes/upload');
// app.use('/upload', sign_s3.sign_s3);

//
// !fs.existsSync("uploads") && fs.mkdirSync("uploads");
// module.exports.uploadsPath = path.join(__dirname, "uploads/");

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"), {
        maxAge: cacheRefresh,
    });
});

liveBidsServer.listen(PORT, (err) => {
    if (err) throw err;

    console.log("Server Running at " + PORT);
});
