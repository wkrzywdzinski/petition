const express = require("express");
const app = express();
var cookieSession = require("cookie-session");
const hb = require("express-handlebars");
const bodyParser = require("body-parser");
const csurf = require("csurf");
const db = require("./db");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

/////////////////////////middleware///////////////////
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
//////////////////get route////////////

app.get("/", (req, res) => {
  res.redirect("/register");
});

app.get("/register", (req, res) => {
  if (req.session.id) {
    res.redirect("/sign");
  } else
    res.render("register", {
      layout: "main"
    });
});

app.get("/login", (req, res) => {
  if (req.session.id) {
    res.redirect("/sign");
  } else {
    res.render("login", {
      layout: "main"
    });
  }
});

app.get("/sign", (req, res) => {
  if (req.session.signed) {
    res.redirect("/thanks");
  } else if (!req.session.id) {
    res.redirect("/register");
  } else {
    res.render("sign", {
      layout: "main"
    });
  }
});

app.get("/thanks", (req, res) => {
  if (!req.session.id) {
    res.redirect("/register");
  } else if (req.session.signed) {
    db.getsignature(req.session.id).then(function(results) {
      req.session.signed = true;
      res.render("thanks", {
        layout: "main",
        signature: results.rows[0].signature
      });
    });
  } else if (req.session.id) {
    res.redirect("sign");
  }
});
app.get("/moreinfo", (req, res) => {
  if (!req.session.id) {
    res.redirect("/register");
  } else {
    res.render("moreinfo", {
      layout: "main"
    });
  }
});
app.get("/edit", checkUser, (req, res) => {
  db.editinfo(req.session.id).then(function(results) {
    res.render("edit", {
      layout: "main",
      info: results.rows[0]
    });
  });
});
app.get("/logout", (req, res) => {
  req.session = null;
  res.render("logout", {
    layout: "main"
  });
});
app.get("/signers", (req, res) => {
  db.getcity("Berlin").then(function(cityres) {});
  db.getsigners().then(function(results) {
    res.render("signers", {
      layout: "main",
      list: results.rows
    });
  });
});
app.get("/signers/:city", (req, res) => {
  db.getcity(req.params.city).then(function(results) {
    res.render("signerscity", {
      layout: "main",
      list: results.rows
    });
  });
});
app.get("*", function(req, res) {
  res.redirect("/");
});
//////////////////// post route///////////////////

app.post("/login", function(req, res) {
  db.getuser(req.body.email)
    .then(function(results) {
      return db
        .checkPassword(req.body.password, results.rows[0].password)
        .then(function(check) {
          if (check) {
            req.session.id = results.rows[0].id;
            db.checksignature(req.session.id).then(function(results) {
              if (results.rows.length) {
                req.session.signed = true;
                res.redirect("/sign");
              } else {
                res.redirect("/sign");
              }
            });
          } else {
            throw err;
          }
        });
    })
    .catch(function(err) {
      console.log(err);
      res.render("login", {
        layout: "main",
        error: err
      });
    });
});

app.post("/register", function(req, res) {
  db.hashPassword(req.body.password)
    .then(function(password) {
      db.createuser(
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        password
      )
        .then(function(results) {
          req.session.id = results.rows[0].id;
          res.redirect("/moreinfo");
        })
        .catch(function(err) {
          console.log(err);
          res.render("register", {
            layout: "main",
            error: err
          });
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

app.post("/sign", function(req, res) {
  db.createsignature(req.session.id, req.body.signaturedata)
    .then(function(results) {
      return db.getsignature(req.session.id);
    })
    .then(function(results) {
      req.session.signed = true;
      res.redirect("/thanks");
    })
    .catch(function(err) {
      console.log(err);
      res.render("sign", {
        layout: "main",
        error: err
      });
    });
});
app.post("/moreinfo", function(req, res) {
  db.insertinfo(req.session.id, req.body.age, req.body.city, req.body.url)
    .then(function() {
      res.redirect("/sign");
    })
    .catch(function(err) {
      console.log(err);
      res.render("login", {
        layout: "main",
        error: err
      });
    });
});
app.post("/signaturedelete", function(req, res) {
  db.deletesignature(req.session.id)
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
app.post("/edit", function(req, res) {
  if (req.body.password) {
    db.hashPassword(req.body.password).then(function(password) {
      db.updateusersdata(
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        password,
        req.session.id
      );
    });
  } else {
    db.updateusersdata(
      req.body.firstname,
      req.body.lastname,
      req.body.email,
      req.body.password,
      req.session.id
    );
  }
  db.updatefullinfo(req.body.age, req.body.city, req.body.url, req.session.id)
    .then(res.redirect("/thanks"))
    .catch(function(err) {
      console.log(err);
      res.render("edit", {
        layout: "main",
        error: err
      });
    });
});

function checkUser(req, res, next) {
  if (!req.session.id) {
    res.redirect("/register");
  } else {
    next();
  }
}

////////////// server ///////////

app.listen(process.env.PORT || 8080, () => {
  console.log("listening 8080");
});
