const db = require('../../config/db');

const getAllTodos = async () => {
    const [rows] = await db.query('SELECT * FROM todo ORDER BY created_at DESC');
    return rows;
};

const getTodoById = async (id) => {
    const [rows] = await db.query('SELECT * FROM todo WHERE id = ?', [id]);
    return rows[0];
};

const getTodosByUserId = async (userId) => {
    const [rows] = await db.query(
        'SELECT * FROM todo WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
    );
    return rows;
};

const createTodo = async (data) => {
    const { title, description, due_time, user_id, status } = data;
    const [result] = await db.query(
        'INSERT INTO todo (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, ?)',
        [title, description, due_time, user_id, status || 'not started']
    );
    return getTodoById(result.insertId);
};

const updateTodo = async (id, data) => {
    const { title, description, due_time, user_id, status } = data;
    await db.query(
        'UPDATE todo SET title = ?, description = ?, due_time = ?, user_id = ?, status = ? WHERE id = ?',
        [title, description, due_time, user_id, status, id]
    );
    return getTodoById(id);
};

const deleteTodo = async (id) => {
    await db.query('DELETE FROM todo WHERE id = ?', [id]);
};

module.exports = {
    getAllTodos,
    getTodoById,
    getTodosByUserId,
    createTodo,
    updateTodo,
    deleteTodo
};
