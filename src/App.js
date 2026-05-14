import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8080/api";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ title: '', desc: '', deadline: '', time: '' });
  const [viewingTask, setViewingTask] = useState(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchTasks = async () => {
    if (!user) return;
    const res = await axios.get(`${API_URL}/tasks`, getHeaders());
    setTasks(res.data);
  };

  useEffect(() => { fetchTasks(); }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      tasks.forEach(task => {
        if (!task.completed && task.deadline === currentDate && task.time === currentTime) {
          alert(`🔔 НАГАДУВАННЯ: ${task.title}\n ЧАС: ${task.time}`);
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [tasks]);

  const saveTask = async () => {
    await axios.post(`${API_URL}/tasks`, formData, getHeaders());
    setFormData({ title: '', desc: '', deadline: '', time: '' });
    fetchTasks();
  };

  if (!user) return <Login setUser={setUser} />;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>Task Manager 2026</h1>
      <button onClick={() => { localStorage.clear(); window.location.reload(); }}>Вийти</button>
      
      <div style={{ background: '#f0f2f5', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
        <h3>Планування нової задачі</h3>
        <input placeholder="Назва" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={sInput} />
        <textarea placeholder="Опис" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} style={sInput} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} style={sInput} />
          <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} style={sInput} />
        </div>
        <button onClick={saveTask} style={sBtn}>Створити і запланувати</button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Ваш список справ:</h3>
        {tasks.map(t => (
          <div key={t.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
            <strong>{t.title}</strong> — 📅 {t.deadline} в 🕒 {t.time}
            <button onClick={() => setViewingTask(t)} style={{ marginLeft: '10px' }}>Детали</button>
            <button onClick={async () => { await axios.delete(`${API_URL}/tasks/${t.id}`, getHeaders()); fetchTasks(); }} style={{ color: 'red', marginLeft: '5px' }}>Удалить</button>
          </div>
        ))}
      </div>

      {viewingTask && (
        <div style={modalStyle}>
          <div style={modalContent}>
            <h2>Деталі: {viewingTask.title}</h2>
            <p><strong>Опис:</strong> {viewingTask.desc}</p>
            <p><strong>Заплановано на:</strong> {viewingTask.deadline} в {viewingTask.time}</p>
            <button onClick={() => setViewingTask(null)}>Закрити</button>
          </div>
        </div>
      )}
    </div>
  );
}

const sInput = { display: 'block', width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' };
const sBtn = { padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '5px' };
const modalStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContent = { background: '#fff', padding: '30px', borderRadius: '10px', maxWidth: '400px', width: '100%' };

function Login({ setUser }) {
  const [form, setForm] = useState({ email: 'user@test.com', password: '123' });
  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch { alert("Помилка!"); }
  };
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Вхід</h1>
      <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /><br/><br/>
      <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /><br/><br/>
      <button onClick={login}>Увійти</button>
    </div>
  );
}

export default App;