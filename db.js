const spicedPg = require('spiced-pg')

const db = spicedPg(
    `postgres:postgres:anneanneanne@localhost:5432/petition`
);

exports.createsignature = function(name, lastname, signature) {
    return db.query(
        `INSERT INTO petition (name, lastname, signature)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [name, lastname, signature]
    )
}
