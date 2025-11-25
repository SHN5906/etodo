const express = require('express');
const auth = require('../../middleware/auth');
const {
    getAllTodos,
    getTodoById,
    getTodosByUserId,
    createTodo,
    updateTodo,
    deleteTodo
} = require('./todos.query');

const router = express.Router();

// GET /todos - Get all todos
router.get('/todos', auth, async (req, res) => {
    try {
        const todos = await getAllTodos();
        res.json(todos);
    } catch (error) {
        console.error('Get todos error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// GET /todos/:id - Get todo by id
router.get('/todos/:id', auth, async (req, res) => {
    try {
        const todo = await getTodoById(req.params.id);
        if (!todo) {
            return res.status(404).json({ msg: 'Not found' });
        }
        res.json(todo);
    } catch (error) {
        console.error('Get todo error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// POST /todos - Create todo
router.post('/todos', auth, async (req, res) => {
    try {
        const { title, description, due_time, user_id, status } = req.body;

        if (!title || !description || !due_time || !user_id) {
            return res.status(400).json({ msg: 'Bad parameter' });
        }

        const todo = await createTodo({ title, description, due_time, user_id, status });
        res.status(201).json(todo);
    } catch (error) {
        console.error('Create todo error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// PUT /todos/:id - Update todo
router.put('/todos/:id', auth, async (req, res) => {
    try {
        const { title, description, due_time, user_id, status } = req.body;

        const existing = await getTodoById(req.params.id);
        if (!existing) {
            return res.status(404).json({ msg: 'Not found' });
        }

        if (!title || !description || !due_time || !user_id) {
            return res.status(400).json({ msg: 'Bad parameter' });
        }

        const todo = await updateTodo(req.params.id, { title, description, due_time, user_id, status });
        res.json(todo);
    } catch (error) {
        console.error('Update todo error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// DELETE /todos/:id - Delete todo
router.delete('/todos/:id', auth, async (req, res) => {
    try {
        const todo = await getTodoById(req.params.id);
        if (!todo) {
            return res.status(404).json({ msg: 'Not found' });
        }

        await deleteTodo(req.params.id);
        res.json({ msg: `Successfully deleted record number: ${req.params.id}` });
    } catch (error) {
        console.error('Delete todo error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

module.exports = router;
