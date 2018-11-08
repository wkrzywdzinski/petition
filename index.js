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
/////////// redirect /////////
app.use(function(req, res, next) {
  if (!req.session.petitionsigned && req.url != "/") {
    res.redirect("/")
  } else if (req.session.petitionsigned && req.url != "/signed") {
    res.redirect("/signed")
}
   else {
    next()}
})
////////////////////get route////////////

app.get("/", (req, res) => {
  res.render("sign", {
    layout: "main"
  });
});

app.get("/signed", (req, res) => {
  res.render("signed", {
    layout: "main"
  });
});

//////////////////// post route///////////////////

app.post("/", function(req, res) {
  db.createsignature(req.body.firstname, req.body.lastname, req.body.signaturedata).then(function(results) {
    req.session.petitionsigned = true
let id = results.rows[0].id
return db.getsignature(id)
  }).then(function (results) {
    console.log(results.rows[0].signature);
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
