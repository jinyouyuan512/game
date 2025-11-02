// you/server/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, mockData, User } from './server.js'; // Import supabase, mockData and User proxy

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

// 管理员认证中间件
const authenticateAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    // 从server.js获取模型引用
    const { getModels } = require('./server.js');
    const models = getModels();
    
    // 查找有效的管理员会话
    const session = await models.AdminSession.findOne({
      where: {
        session_token: token,
        expires_at: { [models.Sequelize.Op.gt]: new Date() }
      },
      include: [{ model: models.Admin }]
    });

    if (!session || !session.Admin || session.Admin.status !== 'active') {
      return res.status(401).json({ message: '无效的管理员会话' });
    }

    // 将管理员信息添加到请求对象
    req.admin = {
      id: session.Admin.id,
      username: session.Admin.username,
      role: session.Admin.role
    };

    next();
  } catch (error) {
    console.error('管理员认证错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 权限检查中间件
const checkAdminRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: '未认证的管理员' });
    }

    // 超级管理员拥有所有权限
    if (req.admin.role === 'superadmin') {
      return next();
    }

    // 检查角色权限
    if (req.admin.role !== requiredRole) {
      return res.status(403).json({ message: '权限不足' });
    }

    next();
  };
};

// --- API Routes ---

// Register User
router.post('/register', async (req, res) => {
  console.log('====== 收到注册请求 ======');
  console.log('注册请求体:', req.body);
  
  const { username, password, email } = req.body;

  if (!username || !password) {
    console.log('注册请求参数不完整:', { username: !!username, password: !!password });
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    console.log('开始检查用户是否已存在:', username);
    // 首先检查用户是否已存在
    let userExists = false;
    try {
      // 尝试从Supabase检查
      console.log('尝试从Supabase检查用户是否存在');
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();
        
      console.log('Supabase检查结果:', { hasData: !!data, error: error?.message });
      userExists = !!data;
    } catch (error) {
      console.warn('Supabase查询失败，检查模拟数据:', error.message);
      // 检查模拟数据
      userExists = mockData.users.some(u => u.username === username);
      console.log('模拟数据检查结果:', { exists: userExists });
    }
    
    if (userExists) {
      console.log('用户名已存在:', username);
      return res.status(409).json({ message: 'Username already taken' });
    }
    
    console.log('用户名可用，准备创建用户:', username);

    // Hash password
    console.log('开始加密密码');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('密码加密完成');

    // 创建用户数据
    const userData = {
      username,
      password: hashedPassword,
      email: email || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('用户数据准备完成，即将调用User.create()');

    // 使用User代理对象创建用户，它会自动处理Supabase和模拟数据的逻辑
    let newUser;
    try {
      newUser = await User.create(userData);
      console.log('成功创建用户:', { id: newUser.id, username: newUser.username });
    } catch (error) {
      console.error('创建用户失败:', error);
      throw new Error('创建用户失败，请稍后重试');
    }

    // Generate JWT token
    console.log('生成JWT token');
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, SECRET_KEY, { expiresIn: '1h' });

    console.log('注册完成，返回响应');
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  } finally {
    console.log('====== 注册请求处理完成 ======');
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

// 注销路由
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // 更新在线状态
    try {
      await supabase
        .from('users')
        .update({ 
          online_status: false,
          last_active: new Date() 
        })
        .eq('id', req.user.id);
    } catch (error) {
      console.warn('更新在线状态失败:', error.message);
    }
    
    res.json({ message: '注销成功' });
    
  } catch (error) {
    console.error('注销错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let user;
    let profile = null;
    
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
        
        // 获取用户资料
        try {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', req.user.id)
            .single();
          profile = profileData;
        } catch (profileError) {
          console.warn('获取用户资料失败:', profileError.message);
        }
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
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      online_status: user.online_status,
      last_active: user.last_active,
      profile: profile ? {
        nickname: profile.nickname,
        avatar: profile.avatar,
        bio: profile.bio,
        updated_at: profile.updated_at
      } : null
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error during profile retrieval' });
  }
});

// 更新用户资料
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nickname, avatar, bio } = req.body;
    
    // 检查或创建用户资料
    let profile;
    try {
      // 尝试获取现有资料
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', req.user.id)
        .single();
      
      if (!error && data) {
        // 更新现有资料
        const { data: updatedProfile } = await supabase
          .from('user_profiles')
          .update({
            nickname: nickname !== undefined ? nickname : data.nickname,
            avatar: avatar !== undefined ? avatar : data.avatar,
            bio: bio !== undefined ? bio : data.bio,
            updated_at: new Date()
          })
          .eq('id', data.id)
          .single();
        profile = updatedProfile;
      } else {
        // 创建新资料
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            user_id: req.user.id,
            nickname: nickname || '',
            avatar: avatar || null,
            bio: bio || null,
            updated_at: new Date()
          })
          .select()
          .single();
        profile = newProfile;
      }
    } catch (error) {
      console.error('更新用户资料失败:', error);
      return res.status(500).json({ message: '更新用户资料失败' });
    }
    
    res.json({
      id: profile.id,
      user_id: profile.user_id,
      nickname: profile.nickname,
      avatar: profile.avatar,
      bio: profile.bio,
      updated_at: profile.updated_at
    });
    
  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
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

// Export router and middleware
export { router as authRouter, authenticateToken, authenticateAdminToken, checkAdminRole };

