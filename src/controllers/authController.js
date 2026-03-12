const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { sendPasswordResetEmail } = require('../services/emailService');

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM members WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

            res.json({
                id: user.id,
                name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                email: user.email,
                token: token
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const registerUser = async (req, res) => {
    const { member_number, first_name, last_name, email, phone, password, role } = req.body;

    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const existing = await pool.query('SELECT id FROM members WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const mNumber = member_number || `M-${Date.now()}`;

        const result = await pool.query(
            `INSERT INTO members (member_number, first_name, last_name, email, phone, password, role)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [mNumber, first_name, last_name, email, phone || null, hashed, role || 'member']
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: 'Not authorized' });

        const result = await pool.query('SELECT id, member_number, first_name, last_name, email, phone, role, is_active, created_at FROM members WHERE id = $1', [userId]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: 'Not authorized' });

        const { first_name, last_name, email, phone, current_password, new_password } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if email is already taken by another user
        if (email) {
            const emailCheck = await pool.query('SELECT id FROM members WHERE email = $1 AND id != $2', [email, userId]);
            if (emailCheck.rows.length > 0) {
                return res.status(409).json({ message: 'Email is already in use' });
            }
        }

        // If updating password, verify current password
        let hashedPassword = null;
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({ message: 'Current password is required to change password' });
            }

            const userResult = await pool.query('SELECT password FROM members WHERE id = $1', [userId]);
            const user = userResult.rows[0];

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isMatch = await bcrypt.compare(current_password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            hashedPassword = await bcrypt.hash(new_password, 10);
        }

        // Build update query dynamically
        let updateFields = ['first_name = $1', 'last_name = $2', 'email = $3', 'phone = $4'];
        let params = [first_name, last_name, email, phone || null];

        if (hashedPassword) {
            updateFields.push(`password = $${params.length + 1}`);
            params.push(hashedPassword);
        }

        params.push(userId);
        const userIndex = params.length;

        const query = `
            UPDATE members 
            SET ${updateFields.join(', ')}
            WHERE id = $${userIndex}
            RETURNING id, member_number, first_name, last_name, email, phone, role, is_active, created_at
        `;

        const result = await pool.query(query, params);
        
        if (!result.rows[0]) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = result.rows[0];

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (err) {
        console.error('Profile update error:', err.message);
        console.error('Error details:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const result = await pool.query('SELECT id, email, first_name FROM members WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'No account found with that email address' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query(
            'UPDATE members SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
            [hashedToken, expires, user.id]
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        await sendPasswordResetEmail(user.email, resetUrl);

        res.json({ message: 'Password reset email sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const result = await pool.query(
            'SELECT id FROM members WHERE password_reset_token = $1 AND password_reset_expires > $2',
            [hashedToken, new Date()]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        const hashed = await bcrypt.hash(password, 10);

        await pool.query(
            'UPDATE members SET password = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
            [hashed, user.id]
        );

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { loginUser, registerUser, getProfile, updateProfile, forgotPassword, resetPassword };
