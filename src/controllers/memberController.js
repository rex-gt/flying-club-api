const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const getMembers = async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM members ORDER BY last_name, first_name'
    );
    res.json(result.rows);
};

module.exports = { getMembers };