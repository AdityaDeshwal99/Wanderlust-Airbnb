const User = require("../models/user");

// get request route  for signUp page Callback
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// Post request route for signUp page Callback
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    // Login After SignUp
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome To WandeLust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// get request route for login page Callback
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// post request route for login page Callback
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to WanderLust !");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// logout get request route Callback
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out !");
    res.redirect("/listings");
  });
};
