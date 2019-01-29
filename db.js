const spicedPg = require("spiced-pg");
var bcrypt = require("bcryptjs");
var bcrypt = require("bcryptjs");
const db = spicedPg(
  process.env.DATABASE_URL ||
    `postgres:postgres:anneanneanne@localhost:5432/petition`
);

///////////////////// MAIN PART /////////////////

/// REGISTER - creates user ///
exports.createUser = function(name, lastname, email, password) {
  if (password) {
    return db.query(
      `INSERT INTO usersdata (name, lastname, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
      [name || null, lastname || null, email || null, password || null]
    );
  } else {
    return db.query(
      `INSERT INTO usersdata (name, lastname, email)
          VALUES ($1, $2, $3)
          RETURNING id`,
      [name || null, lastname || null, email || null]
    );
  }
};

/// REGISTER - hashes password ///
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
      });
    });
  });
};

/// LOGIN - checks for user ///
exports.getUser = email => {
  return db.query(
    `SELECT *
        FROM usersdata
        WHERE email = $1`,
    [email]
  );
};

/// LOGIN - checks password ///
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

/// LOGIN - checks if user signed petition ///
exports.checkSignature = id => {
  return db.query(
    `SELECT *
        FROM signatures
        WHERE userID = $1`,
    [id]
  );
};

/// INSERTS users signature ///
exports.createSignature = function(userID, signature) {
  return db.query(
    `INSERT INTO signatures (userID, signature)
        VALUES ($1, $2)
        RETURNING id`,
    [userID || null, signature || null]
  );
};

/// DELETE users signature ///
exports.deleteSignature = userID => {
  return db.query(
    `DELETE FROM signatures
        WHERE userID = $1`,
    [userID]
  );
};

/// GETS users signature for the thankyou page after petition was signed ///
exports.getSignature = userID => {
  return db.query(
    `SELECT signature
        FROM signatures
        WHERE userID = $1`,
    [userID]
  );
};

/// INSERTS additional user info (age,city, url) ///
exports.insertInfo = function(userID, age, city, url) {
  return db.query(
    `INSERT INTO fullinfo (userID, age, city, url)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
    [userID || null, age || null, city || null, url || null]
  );
};

/// UPDATES additional user info (age,city, url) ///
exports.updateFullInfo = function(age, city, url, userID) {
  return db.query(
    `INSERT INTO fullinfo (age, city, url, userID)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (userID)
    DO UPDATE SET age = $1, city = $2, url = $3`,
    [age || null, city || null, url || null, userID || null]
  );
};

/// UPDATES basic user info(name,lastname, email) with or without password ///
exports.updateUsersdata = function(name, lastname, email, password, userID) {
  if (password) {
    return db.query(
      `UPDATE usersdata
      SET name = $1, lastname = $2, email = $3, password = $4
      WHERE id = $5 `,
      [
        name || null,
        lastname || null,
        email || null,
        password || null,
        userID || null
      ]
    );
  } else {
    return db.query(
      `UPDATE usersdata
      SET name = $1, lastname = $2, email = $3
      WHERE id = $4 `,
      [name || null, lastname || null, email || null, userID || null]
    );
  }
};

/// GETS the current user info for the 'edit' route ///
exports.editInfo = function(userID) {
  return db.query(
    `SELECT name, lastname, age, city, url, email
       FROM signatures
       LEFT JOIN usersdata
       ON usersdata.id = signatures.userID
       LEFT JOIN fullinfo
       ON fullinfo.userID = signatures.userID
       WHERE signatures.userID = $1`,
    [userID]
  );
};

/// GETS list of users who signed petition ///
exports.getSigners = function() {
  return db.query(
    `SELECT name, lastname, age, city, url
       FROM signatures
       LEFT JOIN usersdata
       ON usersdata.id = signatures.userID
       LEFT JOIN fullinfo
       ON fullinfo.userID = signatures.userID`
  );
};

/// GETS list of users who signed petition BY CITY ///
exports.getCity = function(city) {
  return db.query(
    `SELECT name, lastname, age, city, url
       FROM signatures
       LEFT JOIN usersdata
       ON usersdata.id = signatures.userID
       LEFT JOIN fullinfo
       ON fullinfo.userID = signatures.userID
       WHERE LOWER(city) = LOWER($1)`,
    [city]
  );
};
