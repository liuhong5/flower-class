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

// 验证码存储（生产环境应使用Redis）
const verificationCodes = new Map();

// 发送注册验证码接口
app.post('/api/send-verification-code', async (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
    return res.status(400).json({ error: '请输入正确的手机号码' });
  }
  
  try {
    // 检查手机号是否已注册
    const { data: existingUser } = await supabase
      .from('users')
      .select('phone_number')
      .eq('phone_number', phoneNumber)
      .maybeSingle();
    
    if (existingUser) {
      return res.status(400).json({ error: '该手机号码已被注册' });
    }
    
    // 生成验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 存储验证码（5分钟有效）
    verificationCodes.set(phoneNumber, {
      code,
      timestamp: Date.now(),
      attempts: 0
    });
    
    // 清理过期验证码
    setTimeout(() => {
      verificationCodes.delete(phoneNumber);
    }, 5 * 60 * 1000);
    
    // 模拟发送短信（实际应集成短信服务）
    console.log(`发送验证码到 ${phoneNumber}: ${code}`);
    
    res.json({ message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ error: '发送验证码失败' });
  }
});

// 发送重置密码验证码接口
app.post('/api/send-reset-code', async (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
    return res.status(400).json({ error: '请输入正确的手机号码' });
  }
  
  try {
    // 检查手机号是否已注册
    const { data: existingUser } = await supabase
      .from('users')
      .select('phone_number')
      .eq('phone_number', phoneNumber)
      .maybeSingle();
    
    if (!existingUser) {
      return res.status(400).json({ error: '该手机号码未注册' });
    }
    
    // 生成验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 存储验证码（5分钟有效）
    verificationCodes.set(phoneNumber, {
      code,
      timestamp: Date.now(),
      attempts: 0,
      type: 'reset'
    });
    
    // 清理过期验证码
    setTimeout(() => {
      verificationCodes.delete(phoneNumber);
    }, 5 * 60 * 1000);
    
    console.log(`发送重置密码验证码到 ${phoneNumber}: ${code}`);
    
    res.json({ message: '验证码已发送' });
  } catch (error) {
    console.error('发送重置验证码失败:', error);
    res.status(500).json({ error: '发送验证码失败' });
  }
});

// 重置密码接口
app.post('/api/reset-password', async (req, res) => {
  const { phoneNumber, verificationCode, newPassword } = req.body;
  
  if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
    return res.status(400).json({ error: '请输入正确的手机号码' });
  }
  
  if (!verificationCode || verificationCode.length !== 6) {
    return res.status(400).json({ error: '请输入正确的验证码' });
  }
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: '密码长度至少6个字符' });
  }
  
  // 验证验证码
  const storedData = verificationCodes.get(phoneNumber);
  if (!storedData || storedData.type !== 'reset') {
    return res.status(400).json({ error: '验证码已过期，请重新发送' });
  }
  
  if (storedData.code !== verificationCode) {
    storedData.attempts++;
    if (storedData.attempts >= 3) {
      verificationCodes.delete(phoneNumber);
      return res.status(400).json({ error: '验证码错误次数过多，请重新发送' });
    }
    return res.status(400).json({ error: '验证码错误' });
  }
  
  try {
    // 更新密码
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('phone_number', phoneNumber);
    
    if (error) throw error;
    
    // 清除验证码
    verificationCodes.delete(phoneNumber);
    
    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({ error: '重置密码失败' });
  }
});

// 注册接口（手机验证码）
app.post('/api/register', async (req, res) => {
  const { username, phoneNumber, verificationCode } = req.body;
  
  if (!username || username.trim().length < 3) {
    return res.status(400).json({ error: '用户名长度至少3个字符' });
  }
  
  if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
    return res.status(400).json({ error: '请输入正确的手机号码' });
  }
  
  if (!verificationCode || verificationCode.length !== 6) {
    return res.status(400).json({ error: '请输入正确的验证码' });
  }
  
  // 验证验证码
  const storedData = verificationCodes.get(phoneNumber);
  if (!storedData) {
    return res.status(400).json({ error: '验证码已过期，请重新发送' });
  }
  
  if (storedData.code !== verificationCode) {
    storedData.attempts++;
    if (storedData.attempts >= 3) {
      verificationCodes.delete(phoneNumber);
      return res.status(400).json({ error: '验证码错误次数过多，请重新发送' });
    }
    return res.status(400).json({ error: '验证码错误' });
  }
  
  try {
    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('username, phone_number')
      .or(`username.eq.${username.trim()},phone_number.eq.${phoneNumber}`)
      .maybeSingle();
    
    if (existingUser) {
      if (existingUser.username === username.trim()) {
        return res.status(400).json({ error: '用户名已存在' });
      }
      if (existingUser.phone_number === phoneNumber) {
        return res.status(400).json({ error: '该手机号码已被注册' });
      }
    }
    
    // 创建新用户
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        username: username.trim(), 
        phone_number: phoneNumber,
        password: 'user123', // 默认密码
        role: 'user' 
      }])
      .select();
    
    if (error) {
      console.error('数据库插入错误:', error);
      throw error;
    }
    
    // 清除验证码
    verificationCodes.delete(phoneNumber);
    
    res.json({ message: '注册成功', username: username.trim() });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败: ' + error.message });
  }
});

// 修改密码接口
app.post('/api/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const username = req.user.username;
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: '新密码长度至少6个字符' });
  }
  
  try {
    const { data: user } = await supabase
      .from('users')
      .select('password')
      .eq('username', username)
      .single();
    
    if (!user || user.password !== oldPassword) {
      return res.status(400).json({ error: '原密码错误' });
    }
    
    // 更新密码
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('username', username);
    
    if (error) throw error;
    
    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 重置密码接口
app.post('/api/reset-password', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { username } = req.body;
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ password: 'user123' })
      .eq('username', username);
    
    if (error) throw error;
    
    res.json({ message: '密码已重置为 user123' });
  } catch (error) {
    res.status(500).json({ error: '重置密码失败' });
  }
});

// 登录接口
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 检查数据库中的用户（包括管理员）
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (user && user.password === password) {
      const token = jwt.sign({ username, role: user.role }, JWT_SECRET);
      res.json({ token, role: user.role, username });
    } else {
      // 检查是否是默认管理员账号
      if (username === 'admin' && password === 'thisweb666') {
        const token = jwt.sign({ username: 'admin', role: 'editor' }, JWT_SECRET);
        res.json({ token, role: 'editor', username: 'admin' });
      } else {
        res.status(401).json({ error: '用户名或密码错误' });
      }
    }
  } catch (error) {
    // 如果数据库查询失败，检查是否是默认管理员账号
    if (username === 'admin' && password === 'thisweb666') {
      const token = jwt.sign({ username: 'admin', role: 'editor' }, JWT_SECRET);
      res.json({ token, role: 'editor', username: 'admin' });
    } else {
      res.status(500).json({ error: '登录失败' });
    }
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

// 周表加分接口
app.post('/api/gardens/:id/week-score', authenticateToken, async (req, res) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { id } = req.params;
  const { points, weekNumber, remark } = req.body;
  
  try {
    // 记录周表加分历史
    const { error: logError } = await supabase
      .from('scoring_logs')
      .insert([{ 
        garden_id: id, 
        points: points, 
        scored_by: req.user.username,
        week_number: weekNumber,
        remark: remark || `第${weekNumber}周加分`
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
    console.error('周表加分失败:', error);
    res.status(500).json({ error: '周表加分失败: ' + error.message });
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
    const { data, error } = await supabase
      .from('garden_flowers')
      .select(`
        flowers (
          id, name, score, created_at
        )
      `)
      .eq('garden_id', id);
    
    if (error) throw error;
    
    const flowers = data.map(item => item.flowers);
    res.json(flowers || []);
  } catch (error) {
    res.status(500).json({ error: '获取花田花朵失败' });
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
    
    if (error) throw error;
    
    // 格式化数据，添加周次信息
    const formattedData = data.map(record => ({
      ...record,
      display_text: record.week_number ? 
        `第${record.week_number}周: +${record.points}分` : 
        `+${record.points}分`,
      type: record.week_number ? 'week' : 'regular'
    }));
    
    res.json(formattedData || []);
  } catch (error) {
    res.status(500).json({ error: '获取加分记录失败' });
  }
});

// 获取花田统计信息
app.get('/api/gardens/:id/stats', async (req, res) => {
  const { id } = req.params;
  
  try {
    // 获取花田中的花朵
    const { data: gardenFlowers, error: flowersError } = await supabase
      .from('garden_flowers')
      .select(`
        flowers (
          score
        )
      `)
      .eq('garden_id', id);
    
    if (flowersError) throw flowersError;
    
    const scores = gardenFlowers.map(item => item.flowers.score);
    const totalFlowers = scores.length;
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalFlowers > 0 ? (totalScore / totalFlowers).toFixed(1) : 0;
    const maxScore = totalFlowers > 0 ? Math.max(...scores) : 0;
    const minScore = totalFlowers > 0 ? Math.min(...scores) : 0;
    
    // 获取花田加分记录
    const { data: scoringLogs, error: logsError } = await supabase
      .from('scoring_logs')
      .select('points')
      .eq('garden_id', id);
    
    if (logsError) throw logsError;
    
    const gardenBonusScore = scoringLogs.reduce((sum, log) => sum + log.points, 0);
    
    res.json({
      totalFlowers,
      totalScore,
      averageScore: parseFloat(averageScore),
      maxScore,
      minScore,
      gardenBonusScore
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计信息失败' });
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
    const { data, error } = await supabase
      .from('garden_flowers')
      .insert([{ garden_id: id, flower_id: flowerId }])
      .select();
    
    if (error) throw error;
    
    io.emit('flowerAddedToGarden', { gardenId: id, flowerId });
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: '添加花朵失败' });
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
    res.status(500).json({ error: '移除花朵失败' });
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
    
    const [flowersResult, gardensResult] = await Promise.all([
      flowerQuery.order('score', { ascending: false }),
      gardenQuery.order('score', { ascending: false })
    ]);
    
    res.json({
      flowers: flowersResult.data || [],
      gardens: gardensResult.data || []
    });
  } catch (error) {
    res.status(500).json({ error: '获取排行榜失败' });
  }
});

// 导出数据接口（按小组分区）
app.get('/api/export-data', authenticateToken, async (req, res) => {
  try {
    // 获取所有班级
    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .order('name');
    
    const exportData = [];
    
    for (const classItem of classes) {
      // 获取该班级的花田（小组）
      const { data: gardens } = await supabase
        .from('gardens')
        .select('*')
        .eq('class_id', classItem.id)
        .order('name');
      
      for (const garden of gardens) {
        // 获取花田的周表加分记录
        const { data: weekScores } = await supabase
          .from('scoring_logs')
          .select('*')
          .eq('garden_id', garden.id)
          .not('week_number', 'is', null)
          .order('week_number');
        
        // 按周次整理分数
        const weeklyScores = {};
        weekScores.forEach(score => {
          if (!weeklyScores[score.week_number]) {
            weeklyScores[score.week_number] = 0;
          }
          weeklyScores[score.week_number] += score.points;
        });
        
        // 构建导出行数据
        const rowData = {
          '班级': classItem.name,
          '小组名称': garden.name,
          '总分': garden.score
        };
        
        // 添加各周分数
        for (let week = 1; week <= 20; week++) {
          rowData[`第${week}周`] = weeklyScores[week] || 0;
        }
        
        exportData.push(rowData);
      }
    }
    
    res.json(exportData);
  } catch (error) {
    console.error('导出数据失败:', error);
    res.status(500).json({ error: '导出数据失败' });
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

// Render需要监听端口和0.0.0.0
const PORT = process.env.PORT || 10000;

// 增加超时配置解决502错误
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`🌐 Render访问: https://flower-class.onrender.com`);
});