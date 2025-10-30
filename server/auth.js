// you/server/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, mockData } from './server.js'; // Import supabase and mockData

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// --- Helper Functions ---

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Register User
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // 首先检查用户是否已存在
    let userExists = false;
    try {
      // 尝试从Supabase检查
      const { data } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();
      userExists = !!data;
    } catch (error) {
      console.warn('Supabase查询失败，检查模拟数据:', error.message);
      // 检查模拟数据
      userExists = mockData.users.some(u => u.username === username);
    }
    
    if (userExists) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户数据
    const userData = {
      username,
      password: hashedPassword,
      email: email || null,
      created_at: new Date(),
      updated_at: new Date()
    };

    let newUser;
    try {
      // 尝试使用Supabase创建
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error) throw error;
      newUser = data;
    } catch (error) {
      console.warn('使用Supabase创建用户失败，使用模拟数据:', error.message);
      
      // 模拟数据创建
      const newId = mockData.users.length + 1;
      newUser = { ...userData, id: newId };
      mockData.users.push(newUser);
    }

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, SECRET_KEY, { expiresIn: '1h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    let user = null;
    
    // 尝试从Supabase查找用户
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (data) {
        user = data;
      }
    } catch (error) {
      console.warn('Supabase查询失败，检查模拟数据:', error.message);
    }
    
    // 如果Supabase中没有找到，尝试从模拟数据中查找
    if (!user) {
      user = mockData.users.find(u => u.username === username);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Protected route example (to test authentication)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // req.user contains the decoded JWT payload (id and username)
    // Fetch full user info from database
    const user = await User.findOne({ 
      where: { id: req.user.id },
      attributes: { exclude: ['password'] } // Exclude password from response
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Welcome to your profile',
      user: user,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let user;
    
    // 尝试从Supabase获取用户信息
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();
      
      if (!error && data) {
        // 排除密码字段
        delete data.password;
        user = data;
      }
    } catch (supabaseError) {
      console.warn('使用Supabase获取用户信息失败，尝试使用模拟数据:', supabaseError.message);
    }
    
    // 如果Supabase失败或未找到用户，尝试从模拟数据中查找
    if (!user) {
      user = mockData.users.find(u => u.id === req.user.id);
      if (user) {
        // 排除密码字段
        delete user.password;
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({
      user: user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, (req, res) => {
  // In a stateless JWT implementation, the client simply discards the token
  // This endpoint is mainly for consistency and potential future token blacklisting
  res.json({ message: 'Logged out successfully' });
});

export { router as authRouter, authenticateToken };

