const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const { getUserById, getUserByEmail, updateUser, deleteUser } = require('./user.query');
const { getTodosByUserId } = require('../todos/todos.query');

const router = express.Router();

// GET /user - Get current logged user info
router.get('/user', auth, async (req, res) => {
    try {
        const user = await getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'Not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// GET /user/todos - Get all todos of current user
router.get('/user/todos', auth, async (req, res) => {
    try {
        const todos = await getTodosByUserId(req.user.id);
        res.json(todos);
    } catch (error) {
        console.error('Get user todos error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// GET /users/:id - Get user by ID or email
router.get('/users/:param', auth, async (req, res) => {
    try {
        const param = req.params.param;
        let user;

        // Check if param is email or ID
        if (param.includes('@')) {
            user = await getUserByEmail(param);
        } else {
            user = await getUserById(param);
        }

        if (!user) {
            return res.status(404).json({ msg: 'Not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user by param error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// PUT /users/:id - Update user
router.put('/users/:id', auth, async (req, res) => {
    try {
        const { email, password, name, firstname } = req.body;

        const existing = await getUserById(req.params.id);
        if (!existing) {
            return res.status(404).json({ msg: 'Not found' });
        }

        if (!email || !password || !name || !firstname) {
            return res.status(400).json({ msg: 'Bad parameter' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await updateUser(req.params.id, {
            email,
            password: hashedPassword,
            name,
            firstname
        });

        res.json(user);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// DELETE /users/:id - Delete user
router.delete('/users/:id', auth, async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Not found' });
        }

        await deleteUser(req.params.id);
        res.json({ msg: `Successfully deleted record number: ${req.params.id}` });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

module.exports = router;
