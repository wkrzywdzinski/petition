const express = require("express");
const app = express();
var cookieSession = require('cookie-session');
const hb = require("express-handlebars");
const bodyParser = require('body-parser')
const csurf = require('csurf');
const db = require('./db')
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

/////////////////////////middleware///////////////////
app.use(cookieSession({
    secret: `you dont wanna know.`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));
app.use(express.static("./public"))
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
///////// redirect /////////
//
// app.use(function(req, res, next) {
//   if (!req.session.id && req.url != "/signin" && !req.session.petitionsigned) {
//     res.redirect("/signin")
//   } else if (req.session.id && !req.session.petitionsigned) {
//     res.redirect("/sign")
// }
//    else {
//     next()}
// })
//////////////////get route////////////

app.get("/", (req, res) => {
res.redirect("/signin")
});

app.get("/signin", (req, res) => {
  res.render("signin", {
    layout: "main"
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    layout: "main"
  });
});

app.get("/sign", (req, res) => {
  res.render("sign", {
    layout: "main"
  });
});


app.get("/signed", (req, res) => {
  res.render("signed", {
    layout: "main"
  });
});
app.get("/logout", (req, res) => {
  req.session = null;
  console.log(req.session);
  res.render("logout", {
    layout: "main"
  });
});


//////////////////// post route///////////////////
app.post("/login", function(req, res) {
  db.getuser(req.body.email)
  .then(function(results)
  {
    return db.checkPassword(req.body.password, results.rows[0].password).then(function(check) {
        if(check){
          req.session.id = results.rows[0].id
          console.log(req.session)
          res.redirect("/sign")
        }
          else {
            throw err
          }
        })
  })

    .catch(function(err){
      console.log(err)
      res.render("login", {
        layout: "main",
        error : err
      })
      })
      })


app.post("/signin", function(req, res) {
  db.hashPassword(req.body.password)
  .then(function(password){
    db.createuser(req.body.firstname, req.body.lastname, req.body.email, password)
      .then(function(results)
        {
        req.session.id = results.rows[0].id
        console.log(req.session)
        res.redirect("/sign")
      })
    }).catch(function(err){console.log(err)
      res.render("signin", {
        layout: "main",
        error : err
      })
    })});


  app.post("/sign", function(req, res) {
        console.log(req.session.id);
      db.createsignature(req.session.id, req.body.signaturedata).then(function(results) {
      return db.getsignature(req.session.id)
        }).then(function (results) {
          console.log(results);
          res.render("signed", {
            layout: "main",
            signature : results.rows[0].signature
          })

        }).catch(function(err){console.log(err)
          res.render("sign", {
            layout: "main",
            error : err
          })
          })
      });


////////////// server ///////////

app.listen(8080, () => {
  console.log("listening 8080");
});
///////////// req.session = null;
