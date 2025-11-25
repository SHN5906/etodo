const db = require('../../config/db');

const getUserById = async (id) => {
    const [rows] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
    return rows[0];
};

const getUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    return rows[0];
};

const updateUser = async (id, data) => {
    const { email, password, name, firstname } = data;
    await db.query(
        'UPDATE user SET email = ?, password = ?, name = ?, firstname = ? WHERE id = ?',
        [email, password, name, firstname, id]
    );
    return getUserById(id);
};

const deleteUser = async (id) => {
    await db.query('DELETE FROM user WHERE id = ?', [id]);
};

module.exports = {
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser
};
