const spicedPg = require("spiced-pg");
var bcrypt = require("bcryptjs");
var bcrypt = require("bcryptjs");

const db = spicedPg(`postgres:postgres:anneanneanne@localhost:5432/petition`);

exports.createsignature = function(userID, signature) {
  return db.query(
    `INSERT INTO signatures (userID, signature)
        VALUES ($1, $2)
        RETURNING id`,
    [userID || null, signature || null]
  );
};
exports.getsignature = userID => {
  return db.query(
    `SELECT signature
        FROM signatures
        WHERE userID = $1`,
    [userID]
  );
};
exports.createuser = function(name, lastname, email, password) {
  return db.query(
    `INSERT INTO usersdata (name, lastname, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
    [name || null, lastname || null, email || null, password || null]
  );
};
exports.insertinfo = function(userID, age, city, url) {
  return db.query(
    `INSERT INTO fullinfo (userID, age, city, url)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
    [userID || null, age || null, city || null, url || null]
  );
};
exports.getuser = email => {
  return db.query(
    `SELECT *
        FROM usersdata
        WHERE email = $1`,
    [email]
  );
};
exports.getsigners = function() {
  return db.query(
    `SELECT name, lastname, age, city, url
       FROM signatures
       LEFT JOIN usersdata
       ON usersdata.id = signatures.userID
       LEFT JOIN fullinfo
       ON fullinfo.userID = signatures.userID`
  );
};
exports.checksignature = id => {
  return db.query(
    `SELECT *
        FROM signatures
        WHERE userID = $1`,
    [id]
  );
};

exports.hashPassword = function(plainTextPassword) {
  return new Promise(function(resolve, reject) {
    bcrypt.genSalt(function(err, salt) {
      if (err) {
        return reject(err);
      }
      bcrypt.hash(plainTextPassword, salt, function(err, hash) {
        if (err) {
          return reject(err);
        }
        resolve(hash);
        console.log(hash);
      });
    });
  });
};

exports.checkPassword = function(
  textEnteredInLoginForm,
  hashedPasswordFromDatabase
) {
  return new Promise(function(resolve, reject) {
    bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(
      err,
      doesMatch
    ) {
      if (err) {
        reject(err);
      } else {
        resolve(doesMatch);
      }
    });
  });
};
