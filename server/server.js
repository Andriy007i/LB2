const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8080;
const SECRET = 'my_secret_key_123';

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

let tasks = [
    { 
        id: 1, 
        title: 'Сдати проєкт', 
        desc: 'Фінальна версія', 
        deadline: '2026-05-20', 
        time: '14:00',
        completed: false, 
        userId: 2 
    }
];

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if ((email === 'admin@test.com' || email === 'user@test.com') && password === '123') {
        const user = email === 'admin@test.com' ? {id:1, role:'admin'} : {id:2, role:'user'};
        const token = jwt.sign({...user, email}, SECRET);
        return res.json({ token, user: { email, role: user.role } });
    }
    res.status(401).json({ error: 'Помилка' });
});

const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);
        req.user = decoded;
        next();
    });
};

app.get('/api/tasks', auth, (req, res) => {
    const userTasks = req.user.role === 'admin' ? tasks : tasks.filter(t => t.userId === req.user.id);
    res.json(userTasks);
});

app.post('/api/tasks', auth, (req, res) => {
    const newTask = { id: Date.now(), ...req.body, completed: false, userId: req.user.id };
    tasks.push(newTask);
    res.json(newTask);
});

app.delete('/api/tasks/:id', auth, (req, res) => {
    tasks = tasks.filter(t => t.id != req.params.id);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));