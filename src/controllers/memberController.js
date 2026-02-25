const pool = require('../config/database');

const getMembers = async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM members ORDER BY last_name, first_name'
    );
    res.json(result.rows);
};

const getMemberById = async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM members WHERE id = $1', [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
    }
    res.json(result.rows[0]);
};

const createMember = async (req, res) => {
    const { member_number, first_name, last_name, email, phone } = req.body;

    const result = await pool.query(
        `INSERT INTO members (member_number, first_name, last_name, email, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [member_number, first_name, last_name, email, phone]
    );

    res.status(201).json(result.rows[0]);
};

const updateMember = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, phone, is_active } = req.body;

    const result = await pool.query(
        `UPDATE members
         SET first_name = $1, last_name = $2, email = $3, phone = $4, is_active = $5
         WHERE id = $6
         RETURNING *`,
        [first_name, last_name, email, phone, is_active, id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
    }
    res.json(result.rows[0]);
};

const deleteMember = async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully', member: result.rows[0] });
};

module.exports = {
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
};