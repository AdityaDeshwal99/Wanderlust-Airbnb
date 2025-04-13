if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
// for ejs
const path = require("path");
// for better level templates
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// to establish connection with mongodb
async function main() {
  // await mongoose.connect(MONGO_URL);
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

// defining the session options
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

// to use the session
app.use(session(sessionOptions));
// to use the flash
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // authenticate that generates a function that is used in Passport's LocalStrategy
passport.serializeUser(User.serializeUser()); // serializeUser that generates a function that is used by passport to serialize users into the session
passport.deserializeUser(User.deserializeUser()); // deserializeUser that generates a function that is used by passport to deserialize users into the session

// Suucess and Error Route
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Demo User Route
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "deltaa-student",
//   });
//   let registeredUser = await User.register(fakeUser, "helloworld"); // register method register a new user instance in db with a given password(helloworld) and it automatically checks if username is unique
//   res.send(registeredUser);
// });

// these get request redirect into the home page..
// app.get("/",(req,res)=>{
//   res.redirect("/listings")
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

// pure ki pure listing ko use kar rahe hain and all routes ko bhi .
app.use("/listings", listingRouter);

// pure ke pure reviews route ko use kar rahe hain
app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);

// if request does not matches any route then we send standard response.
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Error handling middlewares.
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  //res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Server is lisening to the port 8080");
});
