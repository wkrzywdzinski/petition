const spicedPg = require('spiced-pg')

const db = spicedPg(
    `postgres:postgres:anneanneanne@localhost:5432/petition`
);

exports.createsignature = function(name, lastname, signature) {
    return db.query(
        `INSERT INTO petition (name, lastname, signature)
        VALUES ($1, $2, $3)
        RETURNING id`,
        [name || null, lastname || null, signature || null]
    )
}
exports.getsignature = (id) => {
    return db.query(
        `SELECT signature
        FROM petition
        WHERE id = $1`,
        [id]
    );
};
