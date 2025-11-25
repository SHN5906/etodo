const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');

const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
    try {
        const { email, name, firstname, password } = req.body;

        if (!email || !name || !firstname || !password) {
            return res.status(400).json({ msg: 'Bad parameter' });
        }

        // Check if user exists
        const [existing] = await db.query('SELECT id FROM user WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ msg: 'Account already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO user (email, name, firstname, password) VALUES (?, ?, ?, ?)',
            [email, name, firstname, hashedPassword]
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId, email },
            process.env.SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ token });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Bad parameter' });
        }

        // Find user
        const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

module.exports = router;
