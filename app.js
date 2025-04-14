if (process.env.NODE_ENV != "production") {
  require("dotenv").config(); // to require env file
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
// for ejs
const path = require("path");
// for better level templates
const ejsMate = require("ejs-mate");
// to require ExpressError class
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL; // database connected at atlas

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// to establish connection with mongodb
async function main() {
  await mongoose.connect(dbUrl);
}
// for ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// to extract id from request
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

// to use static files in public folder like css files

app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

// for express-session
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // here we set time for cookie to expire to 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // we use this for preventing against cross scripting attacks
  },
};

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

// to use session
app.use(session(sessionOptions));
// to use connect-flash
app.use(flash());

// implementing passport done after implementing session
// to use passport we require these two
// a middleware that initializes passport
app.use(passport.initialize());
// to implement session
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // all users should be authenticated through localStrategy by using authenticate method
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware for flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; // it will store info of req.user
  next();
});

// creating fake user

// app.get("/demouser", async(req, res) =>{
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
//   });
// let registeredUser = await User.register(fakeUser, "helloworld"); // register method register a new user instance in db with a given password(helloworld) and it automatically checks if username is unique
//     res.send(registeredUser);
// })

// app.get("/testListing", async (req, res) =>{
//       let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//       })
//      await sampleListing.save();
//      console.log("sample was saved");
//      res.send("successful testing");

// });

// these are called parent routes

app.use("/listings", listingRouter);
// for reviews
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// if request does not matches any route and we want to send standard response
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});
app.listen(8080, () => {
  console.log("Server is lisening to the port 8080");
});
