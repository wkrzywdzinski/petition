const express = require("express");
const app = express();
var cookieSession = require("cookie-session");
const hb = require("express-handlebars");
const bodyParser = require("body-parser");
const csurf = require("csurf");
const db = require("./db");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

////////////middleware////////////

app.use(
  cookieSession({
    secret: `you dont wanna know.`,
    maxAge: 1000 * 60 * 60 * 24 * 14
  })
);

app.use(express.static("./public"));

app.use(
  require("body-parser").urlencoded({
    extended: false
  })
);

app.use(csurf());

app.use(function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});

////////////check if user is logged in////////////

function checkUser(req, res, next) {
  if (!req.session.id) {
    res.redirect("/register");
  } else {
    next();
  }
}

///////////////////////GET requests////////////////////////

app.get("/", (req, res) => {
  res.redirect("/register");
});

/// register route ///
app.get("/register", (req, res) => {
  if (req.session.id) {
    res.redirect("/sign");
  } else
    res.render("register", {
      layout: "main"
    });
});

/// login route ///
app.get("/login", (req, res) => {
  if (req.session.id) {
    res.redirect("/sign");
  } else {
    res.render("login", {
      layout: "main"
    });
  }
});

/// sign petition route ///
app.get("/sign", checkUser, (req, res) => {
  if (req.session.signed) {
    res.redirect("/thanks");
  } else {
    res.render("sign", {
      layout: "main"
    });
  }
});

///after petition signed route, shows signature ///
app.get("/thanks", checkUser, (req, res) => {
  if (req.session.signed) {
    db.getSignature(req.session.id).then(function(results) {
      req.session.signed = true;
      res.render("thanks", {
        layout: "main",
        signature: results.rows[0].signature
      });
    });
  } else {
    res.redirect("sign");
  }
});

/// allows user to add additional info (age,city,url) ///
app.get("/moreinfo", checkUser, (req, res) => {
  res.render("moreinfo", {
    layout: "main"
  });
});

/// allows user to edit all the profile data ///
app.get("/edit", checkUser, (req, res) => {
  db.editInfo(req.session.id).then(function(results) {
    res.render("edit", {
      layout: "main",
      info: results.rows[0]
    });
  });
});

/// gets a list of the users who signed the petition ///
app.get("/signers", (req, res) => {
  db.getSigners().then(function(results) {
    res.render("signers", {
      layout: "main",
      list: results.rows
    });
  });
});

/// gets a list of the users who signed the petition by city ///
app.get("/signers/:city", (req, res) => {
  db.getCity(req.params.city).then(function(results) {
    res.render("signerscity", {
      layout: "main",
      list: results.rows
    });
  });
});

/// logout route ///
app.get("/logout", (req, res) => {
  req.session = null;
  res.render("logout", {
    layout: "main"
  });
});

app.get("*", function(req, res) {
  res.redirect("/");
});

//////////////////// POST routes ///////////////////

/// register route - hashes the password, makes database entry ///
app.post("/register", function(req, res) {
  db.hashPassword(req.body.password)
    .then(function(password) {
      db.createUser(
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        password
      ).then(function(results) {
        req.session.id = results.rows[0].id;
        res.redirect("/moreinfo");
      });
    })
    .catch(function(err) {
      console.log(err);
      res.render("register", {
        layout: "main",
        error: err
      });
    });
});

/// login route - checks if user exists and if password is correct ///
app.post("/login", function(req, res) {
  db.getUser(req.body.email)
    .then(function(results) {
      return db
        .checkPassword(req.body.password, results.rows[0].password)
        .then(function(check) {
          if (check) {
            req.session.id = results.rows[0].id;
            db.checkSignature(req.session.id).then(function(results) {
              if (results.rows.length) {
                req.session.signed = true;
                res.redirect("/sign");
              } else {
                res.redirect("/sign");
              }
            });
          }
        });
    })
    .catch(function(err) {
      res.render("login", {
        layout: "main",
        error: err
      });
    });
});

/// CREATES signature ///
app.post("/sign", function(req, res) {
  db.createSignature(req.session.id, req.body.signaturedata)
    .then(function(results) {
      return db.getSignature(req.session.id);
    })
    .then(function(results) {
      req.session.signed = true;
      res.redirect("/thanks");
    })
    .catch(function(err) {
      res.render("sign", {
        layout: "main",
        error: err
      });
    });
});

/// DELETES signature ///
app.post("/signaturedelete", function(req, res) {
  db.deleteSignature(req.session.id)
    .then(function() {
      console.log("deleted");
      req.session.signed = false;
    })
    .then(function() {
      res.redirect("/sign");
    })
    .catch(function(err) {
      console.log(err);
      res.render("sign", {
        layout: "main",
        error: err
      });
    });
});

/// INSERTS additional info to user data (age,city,url) ///
app.post("/moreinfo", function(req, res) {
  db.insertInfo(req.session.id, req.body.age, req.body.city, req.body.url)
    .then(function() {
      res.redirect("/sign");
    })
    .catch(function(err) {
      res.render("login", {
        layout: "main",
        error: err
      });
    });
});

/// UPDATES all user infos with or without password ///
app.post("/edit", function(req, res) {
  if (req.body.password) {
    db.hashPassword(req.body.password).then(function(password) {
      db.updateUsersdata(
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        password,
        req.session.id
      );
    });
  } else {
    db.updateUsersdata(
      req.body.firstname,
      req.body.lastname,
      req.body.email,
      req.body.password,
      req.session.id
    );
  }
  db.updateFullInfo(req.body.age, req.body.city, req.body.url, req.session.id)
    .then(res.redirect("/thanks"))
    .catch(function(err) {
      res.render("edit", {
        layout: "main",
        error: err
      });
    });
});

//////////////////// server ///////////////////////////////////

app.listen(process.env.PORT || 8080, () => {
  console.log("listening 8080");
});
