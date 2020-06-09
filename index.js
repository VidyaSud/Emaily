const express = require("express");

const mongoose = require("mongoose");
const keys = require("./config/keys");

const cookieSession = require("cookie-session");
const passport = require("passport");
const bodyParser = require("body-parser");

require("./models/User");
require("./models/Survey");
require("./models/StockRecon");
require("./services/passport"); //this is the code "const passportConfig =require('./services/passport')" has condeseddown
//as we are not returning anything so no need to assign to variable.

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoosURI);

const app = express();

app.use(bodyParser.json());

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey],
  })
);
app.use(passport.initialize());
app.use(passport.session());

require("./routes/authRoutes")(app);
require("./routes/surveyRoutes")(app);
require("./routes/stockReconroutes")(app);
require("./routes/billingRoutes")(app);

//the above code is the condensed code of below.
// const authRoutes= require('./routes/authRoutes');
// authRoutes(app);

if (process.env.NODE_ENV === "production") {
  // Express will serve up production assets
  // like main.js or main.css file !!
  app.use(express.static("client/build"));

  //Express will serve up index.html
  // if it doesn't recognize the route
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendfile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT);

// '\ 'is used to escape the "" in package.json
