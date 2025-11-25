const API_URL = 'http://localhost:3000';

let allTodos = [];
let currentFilter = 'all';
let currentUserId = null;

// ========== AUTH ==========

function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
    clearErrors();
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    clearErrors();
}

function clearErrors() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('register-error').textContent = '';
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            showApp();
        } else {
            document.getElementById('login-error').textContent = data.msg;
        }
    } catch (err) {
        document.getElementById('login-error').textContent = 'Erreur de connexion';
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const firstname = document.getElementById('register-firstname').value;
    const name = document.getElementById('register-name').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, firstname, name, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            showApp();
        } else {
            document.getElementById('register-error').textContent = data.msg;
        }
    } catch (err) {
        document.getElementById('register-error').textContent = 'Erreur de connexion';
    }
});

function logout() {
    localStorage.removeItem('token');
    showAuth();
}

function showAuth() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
}

async function showApp() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
    await loadUser();
    await loadTodos();
}

// ========== USER ==========

async function loadUser() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const user = await res.json();
            currentUserId = user.id;
            document.getElementById('user-info').textContent = `${user.firstname} ${user.name}`;
        }
    } catch (err) {
        console.error('Load user error:', err);
    }
}

// ========== TODOS ==========

async function loadTodos() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/user/todos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            allTodos = await res.json();
            renderTodos();
        }
    } catch (err) {
        console.error('Load todos error:', err);
    }
}

function renderTodos() {
    const list = document.getElementById('todos-list');
    let todos = allTodos;
    
    if (currentFilter !== 'all') {
        todos = allTodos.filter(t => t.status === currentFilter);
    }
    
    if (todos.length === 0) {
        list.innerHTML = '<div class="empty">Aucune tache</div>';
        return;
    }
    
    list.innerHTML = todos.map(t => `
        <div class="todo-item ${t.status === 'done' ? 'done' : ''}">
            <div class="todo-header">
                <span class="todo-title">${escapeHtml(t.title)}</span>
                <span class="todo-status">${statusText(t.status)}</span>
            </div>
            <p class="todo-desc">${escapeHtml(t.description)}</p>
            <div class="todo-date">${formatDate(t.due_time)}</div>
            <div class="todo-actions">
                <button class="btn btn-secondary btn-sm" onclick="editTodo(${t.id})">modifier</button>
                <button class="btn btn-sm" onclick="deleteTodo(${t.id})">supprimer</button>
            </div>
        </div>
    `).join('');
}

document.getElementById('add-todo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const data = {
        title: document.getElementById('todo-title').value,
        description: document.getElementById('todo-desc').value,
        due_time: document.getElementById('todo-due').value,
        status: document.getElementById('todo-status').value,
        user_id: currentUserId
    };
    
    try {
        const res = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            document.getElementById('add-todo-form').reset();
            await loadTodos();
        }
    } catch (err) {
        console.error('Add todo error:', err);
    }
});

function editTodo(id) {
    const todo = allTodos.find(t => t.id === id);
    if (!todo) return;
    
    document.getElementById('edit-id').value = todo.id;
    document.getElementById('edit-title').value = todo.title;
    document.getElementById('edit-desc').value = todo.description;
    document.getElementById('edit-due').value = todo.due_time.slice(0, 16);
    document.getElementById('edit-status').value = todo.status;
    
    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('edit-id').value;
    
    const data = {
        title: document.getElementById('edit-title').value,
        description: document.getElementById('edit-desc').value,
        due_time: document.getElementById('edit-due').value,
        status: document.getElementById('edit-status').value,
        user_id: currentUserId
    };
    
    try {
        const res = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            closeModal();
            await loadTodos();
        }
    } catch (err) {
        console.error('Edit todo error:', err);
    }
});

async function deleteTodo(id) {
    if (!confirm('Supprimer cette tache ?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            await loadTodos();
        }
    } catch (err) {
        console.error('Delete todo error:', err);
    }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target.id === 'edit-modal') closeModal();
});

// ========== UTILS ==========

function statusText(status) {
    const map = {
        'not started': 'non commence',
        'todo': 'a faire',
        'in progress': 'en cours',
        'done': 'termine'
    };
    return map[status] || status;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showApp();
    } else {
        showAuth();
    }
});
