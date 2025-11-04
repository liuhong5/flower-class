const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Supabase配置 - 请替换为您的实际配置
const supabaseUrl = 'https://zxwweootybxjcdyqfpms.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4d3dlb290eWJ4amNkeXFmcG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODAxMjcsImV4cCI6MjA3Nzc1NjEyN30.q8x1Smz7USlrHuyxMIxZwlssXKntoaKOc-1PLh3jeH4';
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 用户认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 登录接口
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    let userRole = null;
    
    if (username === 'editor' && password === 'myweb666') {
      userRole = 'editor';
    } else if (username === 'user' && password === 'user123') {
      userRole = 'user';
    }
    
    if (userRole) {
      const token = jwt.sign({ username, role: userRole }, JWT_SECRET);
      res.json({ token, role: userRole, username });
    } else {
      res.status(401).json({ error: '用户名或密码错误' });
    }
  } catch (error) {
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取班级列表
app.get('/api/classes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: '获取班级失败' });
  }
});

// 创建班级
app.post('/api/classes', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { name } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert([{ name }])
      .select();
    
    if (error) throw error;
    
    io.emit('classCreated', data[0]);
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: '创建班级失败' });
  }
});

// 获取花朵列表
app.get('/api/flowers', async (req, res) => {
  const { classId } = req.query;
  
  try {
    let query = supabase.from('flowers').select('*');
    
    if (classId) {
      query = query.eq('class_id', classId);
    }
    
    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: '获取花朵失败' });
  }
});

// 创建花朵
app.post('/api/flowers', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { name, classId } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('flowers')
      .insert([{ name, class_id: classId, score: 0 }])
      .select();
    
    if (error) throw error;
    
    io.emit('flowerCreated', data[0]);
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: '创建花朵失败' });
  }
});

// 给花朵浇水
app.post('/api/flowers/:id/water', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { id } = req.params;
  
  try {
    // 先获取当前分数
    const { data: currentFlower, error: fetchError } = await supabase
      .from('flowers')
      .select('score')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // 更新分数
    const { data, error } = await supabase
      .from('flowers')
      .update({ score: currentFlower.score + 1 })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    io.emit('flowerWatered', data[0]);
    res.json(data[0]);
  } catch (error) {
    console.error('浇水失败:', error);
    res.status(500).json({ error: '浇水失败: ' + error.message });
  }
});

// 删除花朵
app.delete('/api/flowers/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { id } = req.params;
  
  try {
    const { error } = await supabase
      .from('flowers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    io.emit('flowerDeleted', { id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '删除花朵失败' });
  }
});

// 获取花田列表
app.get('/api/gardens', async (req, res) => {
  const { classId } = req.query;
  
  try {
    let query = supabase.from('gardens').select('*');
    
    if (classId) {
      query = query.eq('class_id', classId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: '获取花田失败' });
  }
});

// 创建花田
app.post('/api/gardens', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { name, classId } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('gardens')
      .insert([{ name, class_id: classId, score: 0 }])
      .select();
    
    if (error) throw error;
    
    io.emit('gardenCreated', data[0]);
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: '创建花田失败' });
  }
});

// 给花田加分（自定义分数，记录加分历史）
app.post('/api/gardens/:id/score', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { id } = req.params;
  const { points } = req.body;
  
  try {
    // 记录加分历史
    const { error: logError } = await supabase
      .from('scoring_logs')
      .insert([{ 
        garden_id: id, 
        points: points, 
        scored_by: req.user.username 
      }]);
    
    if (logError) throw logError;
    
    // 获取当前分数并更新
    const { data: currentGarden, error: fetchError } = await supabase
      .from('gardens')
      .select('score')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    const { data, error } = await supabase
      .from('gardens')
      .update({ score: currentGarden.score + points })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    io.emit('gardenScored', data[0]);
    res.json(data[0]);
  } catch (error) {
    console.error('加分失败:', error);
    res.status(500).json({ error: '加分失败: ' + error.message });
  }
});

// 删除花田
app.delete('/api/gardens/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { id } = req.params;
  
  try {
    const { error } = await supabase
      .from('gardens')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    io.emit('gardenDeleted', { id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '删除花田失败' });
  }
});

// 删除班级
app.delete('/api/classes/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { id } = req.params;
  
  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    io.emit('classDeleted', { id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '删除班级失败' });
  }
});

// 获取花田中的花朵
app.get('/api/gardens/:id/flowers', async (req, res) => {
  const { id } = req.params;
  
  try {
    // 检查表是否存在，如果不存在返回空数组
    const { data, error } = await supabase
      .from('garden_flowers')
      .select('flower_id')
      .eq('garden_id', id);
    
    if (error) {
      console.log('garden_flowers表可能不存在，返回空数组');
      res.json([]);
      return;
    }
    
    if (!data || data.length === 0) {
      res.json([]);
      return;
    }
    
    // 获取花朵详细信息
    const flowerIds = data.map(item => item.flower_id);
    const { data: flowers, error: flowerError } = await supabase
      .from('flowers')
      .select('*')
      .in('id', flowerIds);
    
    if (flowerError) throw flowerError;
    res.json(flowers || []);
  } catch (error) {
    console.error('获取花田花朵失败:', error);
    res.json([]);
  }
});

// 添加花朵到花田
app.post('/api/gardens/:id/flowers', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { id } = req.params;
  const { flowerId } = req.body;
  
  try {
    // 检查花朵是否已存在于花田中
    const { data: existing } = await supabase
      .from('garden_flowers')
      .select('id')
      .eq('garden_id', id)
      .eq('flower_id', flowerId)
      .single();
    
    if (existing) {
      return res.status(400).json({ error: '花朵已在花田中' });
    }
    
    const { data, error } = await supabase
      .from('garden_flowers')
      .insert([{ garden_id: parseInt(id), flower_id: parseInt(flowerId) }])
      .select();
    
    if (error) {
      console.error('添加花朵错误:', error);
      throw error;
    }
    
    io.emit('flowerAddedToGarden', { gardenId: id, flowerId });
    res.json(data[0]);
  } catch (error) {
    console.error('添加花朵到花田失败:', error);
    res.status(500).json({ error: '添加花朵到花田失败: ' + error.message });
  }
});

// 从花田移除花朵
app.delete('/api/gardens/:gardenId/flowers/:flowerId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { gardenId, flowerId } = req.params;
  
  try {
    const { error } = await supabase
      .from('garden_flowers')
      .delete()
      .eq('garden_id', gardenId)
      .eq('flower_id', flowerId);
    
    if (error) throw error;
    
    io.emit('flowerRemovedFromGarden', { gardenId, flowerId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '从花田移除花朵失败' });
  }
});

// 获取花田加分记录
app.get('/api/gardens/:id/scores', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('scoring_logs')
      .select('*')
      .eq('garden_id', id)
      .order('scored_at', { ascending: false });
    
    if (error) {
      res.json([]);
      return;
    }
    
    res.json(data || []);
  } catch (error) {
    res.json([]);
  }
});

// 获取排行榜
app.get('/api/rankings', async (req, res) => {
  const { classId } = req.query;
  
  try {
    let flowerQuery = supabase.from('flowers').select('*');
    let gardenQuery = supabase.from('gardens').select('*');
    
    if (classId) {
      flowerQuery = flowerQuery.eq('class_id', classId);
      gardenQuery = gardenQuery.eq('class_id', classId);
    }
    
    const { data: flowers, error: flowerError } = await flowerQuery
      .order('score', { ascending: false })
      .limit(10);
    
    const { data: gardens, error: gardenError } = await gardenQuery
      .order('score', { ascending: false })
      .limit(10);
    
    if (flowerError || gardenError) throw flowerError || gardenError;
    
    res.json({ flowers: flowers || [], gardens: gardens || [] });
  } catch (error) {
    res.status(500).json({ error: '获取排行榜失败' });
  }
});

// Socket.IO连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

// 测试数据库连接
supabase.from('classes').select('count').then(({ data, error }) => {
  if (error) {
    console.error('❌ 数据库连接失败:', error.message);
  } else {
    console.log('✅ 数据库连接成功');
  }
});

const PORT = process.env.PORT || 3000;
const os = require('os');

// 获取本机IP地址
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`🌐 本地访问: http://localhost:${PORT}`);
  console.log(`🌐 局域网访问: http://${localIP}:${PORT}`);
  console.log(`📱 手机访问: http://${localIP}:${PORT}`);
});