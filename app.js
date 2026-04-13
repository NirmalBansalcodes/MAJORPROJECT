if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

// DB CONNECTION
async function main() {
    await mongoose.connect(dbUrl);
}

main()
.then(() => {
    console.log(" connected to DB");

    // SESSION STORE (AFTER DB CONNECTS)
    const store = MongoStore.create({
    mongoUrl: dbUrl,
    collectionName: "sessions", // important
    ttl: 14 * 24 * 60 * 60, // 14 days
    autoRemove: "native",
});


    store.on("error", (err) => {
        console.log(" SESSION STORE ERROR:", err);
    });

    const sessionOptions = {
        store,
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        },
    };

    // MIDDLEWARES
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.engine("ejs", ejsMate);
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.static(path.join(__dirname, "/public")));

    app.use(session(sessionOptions));
    app.use(flash());

    // PASSPORT
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // GLOBAL VARIABLES
    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        console.log("GLOBAL USER:", req.user);
        next();
    });

    // ROUTES
    app.use("/listings", listingRouter);
    app.use("/", userRouter);

    // 404
    app.use((req, res, next) => {
        next(new ExpressError(404, "Page not found!"));
    });

    // ERROR HANDLER (FIXED)
    app.use((err, req, res, next) => {
        console.log(" ERROR:", err);

        if (res.headersSent) {
            return next(err);
        }

        res.status(err.statusCode || 500).render("error.ejs", {
            message: err.message || "Something went wrong!",
        });
    });

    // SERVER START
    app.listen(8080, () => {
        console.log(" server is listening to port 8080");
    });
})
.catch((err) => {
    console.log("DB ERROR:", err);
});

// GLOBAL ERROR HANDLING
process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED PROMISE:", err);
});