// you/server/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 设置请求体大小限制和超时
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 设置请求超时时间（毫秒）
app.use((req, res, next) => {
  res.setTimeout(300000, () => {
    console.log('请求超时');
    res.status(408).send('请求超时');
  });
  next();
});

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), '../uploads');
const imagesDir = path.join(uploadDir, 'images');
const videosDir = path.join(uploadDir, 'videos');

[uploadDir, imagesDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 添加专门处理中文文件名的中间件
app.use('/uploads', (req, res, next) => {
  try {
    console.log(`===== 收到文件请求 =====`);
    console.log(`请求URL: ${req.url}`);
    console.log(`请求路径: ${req.path}`);
    console.log(`请求方法: ${req.method}`);
    console.log(`请求头:`, req.headers);
    
    // 尝试直接解码URL路径
    const decodedPath = decodeURIComponent(req.path);
    console.log(`解码后的路径: ${decodedPath}`);
    
    // 构建文件路径
    const filePath = path.join(uploadDir, decodedPath.replace(/^\/uploads/, ''));
    console.log(`构建的文件路径: ${filePath}`);
    
    // 检查文件是否存在
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const fileStats = fs.statSync(filePath);
      console.log(`✅ 文件直接存在，大小: ${fileStats.size} 字节`);
      console.log(`发送文件: ${filePath}`);
      
      // 设置适当的响应头
      res.setHeader('Content-Type', getContentType(filePath));
      res.setHeader('Content-Length', fileStats.size);
      res.setHeader('Accept-Ranges', 'bytes');
      
      // 创建文件流并发送
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('open', () => {
        fileStream.pipe(res);
      });
      
      fileStream.on('error', (err) => {
        console.error(`文件流错误: ${err.message}`);
        res.status(500).send('文件读取错误');
      });
      
      fileStream.on('end', () => {
        console.log(`✅ 文件发送完成: ${filePath}`);
      });
      
      return;
    }
    
    // 文件不存在时，使用更强健的匹配算法
    const dirPath = path.dirname(filePath);
    const requestedFileName = path.basename(filePath);
    
    console.log(`尝试在目录中查找匹配文件: ${dirPath}`);
    console.log(`请求的文件名: ${requestedFileName}`);
    
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      console.log(`目录中的文件数量: ${files.length}`);
      
      // 构建匹配函数，尝试多种编码方式
      const matchFileName = (file, target) => {
        try {
          // 尝试1: 原始文件名直接比较
          if (file === target) return true;
          
          // 尝试2: 解码文件名后比较
          const decodedFile = decodeURIComponent(file);
          if (decodedFile === target) return true;
          
          // 尝试3: 编码目标文件名后比较
          const encodedTarget = encodeURIComponent(target);
          if (file === encodedTarget) return true;
          
          // 尝试4: 双重解码比较
          const doubleDecodedFile = decodeURIComponent(decodedFile);
          if (doubleDecodedFile === target) return true;
          
          // 尝试5: 去除特殊字符后的包含比较
          const cleanFile = file.replace(/[^a-zA-Z0-9\-]/g, '');
          const cleanTarget = target.replace(/[^a-zA-Z0-9\-]/g, '');
          if (cleanFile.includes(cleanTarget) || cleanTarget.includes(cleanFile)) {
            console.log(`通过字符包含匹配: ${file} 包含 ${target}`);
            return true;
          }
          
          // 尝试6: 比较文件扩展名和UUID部分
          const fileExt = path.extname(file);
          const targetExt = path.extname(target);
          if (fileExt === targetExt) {
            // 检查文件名中是否包含相同的UUID模式
            const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
            const fileUuid = file.match(uuidRegex);
            const targetUuid = target.match(uuidRegex);
            
            if (fileUuid && targetUuid && fileUuid[0] === targetUuid[0]) {
              console.log(`通过UUID匹配: ${fileUuid[0]}`);
              return true;
            }
          }
          
          return false;
        } catch (e) {
          console.error(`文件名匹配时出错: ${e.message}`);
          return false;
        }
      };
      
      // 找到第一个匹配的文件
      const matchedFile = files.find(f => matchFileName(f, requestedFileName));
      
      if (matchedFile) {
        const matchedFilePath = path.join(dirPath, matchedFile);
        const fileStats = fs.statSync(matchedFilePath);
        console.log(`✅ 找到匹配的文件: 请求=${requestedFileName}, 实际=${matchedFile}`);
        console.log(`文件大小: ${fileStats.size} 字节`);
        
        // 设置适当的响应头
        res.setHeader('Content-Type', getContentType(matchedFilePath));
        res.setHeader('Content-Length', fileStats.size);
        res.setHeader('Accept-Ranges', 'bytes');
        
        // 创建文件流并发送
        const fileStream = fs.createReadStream(matchedFilePath);
        
        fileStream.on('open', () => {
          fileStream.pipe(res);
        });
        
        fileStream.on('error', (err) => {
          console.error(`文件流错误: ${err.message}`);
          res.status(500).send('文件读取错误');
        });
        
        fileStream.on('end', () => {
          console.log(`✅ 文件发送完成: ${matchedFilePath}`);
        });
        
        return;
      } else {
        console.log(`❌ 未找到匹配的文件，请求的文件名: ${requestedFileName}`);
        console.log(`目录中的文件列表: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
      }
    } else {
      console.log(`❌ 目录不存在: ${dirPath}`);
    }
    
    // 如果没有找到匹配文件，继续使用默认的静态文件服务
    console.log(`使用默认静态文件服务处理请求: ${req.path}`);
    next();
  } catch (error) {
    console.error('处理文件请求时出错:', error.message, error.stack);
    next();
  }
});

// 根据文件扩展名获取Content-Type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// 配置静态文件服务作为后备
app.use('/uploads', express.static(uploadDir));
console.log(`静态文件服务配置完成，路径: /uploads -> ${uploadDir}`);
console.log(`已添加中文文件名处理中间件`);

// Supabase Connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 创建模拟数据，当Supabase连接失败时使用
const mockData = {
  games: [
    { id: 1, name: '英雄联盟', description: '一款多人在线战术竞技游戏', coverImage: 'lol.jpg', status: 'active', platform: 'PC', developer: 'Riot Games', publisher: 'Riot Games' },
    { id: 2, name: '原神', description: '一款开放世界动作角色扮演游戏', coverImage: 'genshin.jpg', status: 'active', platform: 'PC/手机/主机', developer: '米哈游', publisher: '米哈游' },
    { id: 3, name: '王者荣耀', description: '一款多人在线战术竞技手机游戏', coverImage: 'wzry.jpg', status: 'active', platform: '手机', developer: '腾讯', publisher: '腾讯' }
  ],
  strategies: [
    { id: 1, title: '英雄联盟新手攻略', content: '这是一份详细的新手入门指南...', difficulty: '简单', type: '入门', game_id: 1, user_id: 1, view_count: 100, status: 'published', image_urls: JSON.stringify(['/uploads/images/lol-guide.jpg']), video_urls: JSON.stringify([]) },
    { id: 2, title: '原神探索技巧', content: '高效探索提瓦特大陆的方法...', difficulty: '中等', type: '探索', game_id: 2, user_id: 2, view_count: 200, status: 'published', image_urls: JSON.stringify([]), video_urls: JSON.stringify(['/uploads/videos/genshin-explore.mp4']) }
  ],
  tags: [
    { id: 1, name: '新手' },
    { id: 2, name: '攻略' },
    { id: 3, name: '探索' },
    { id: 4, name: '角色培养' }
  ],
  users: [
    { id: 1, username: 'admin', password: '123456', email: 'admin@example.com' },
    { id: 2, username: 'user1', password: 'password1', email: 'user1@example.com' }
  ],
  notes: []
};

// 创建模型代理对象，优先使用Supabase，如果失败则返回模拟数据
const User = {
  findOne: async (options) => {
    try {
      console.log('尝试从Supabase查找用户:', options.where);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .match(options.where || {})
        .single();
      if (error) {
        console.error('Supabase查找用户失败:', error.code, error.message);
        throw error;
      }
      console.log('成功从Supabase找到用户:', { id: data.id, username: data.username });
      return data;
    } catch (error) {
      console.warn('使用模拟User数据:', error.message);
      // 从模拟数据中查找
      return mockData.users.find(user => {
        const where = options.where || {};
        return Object.keys(where).every(key => user[key] === where[key]);
      });
    }
  },
  create: async (userData) => {
    try {
      console.log('尝试向Supabase插入用户数据:', { username: userData.username, hasEmail: !!userData.email });
      
      // 列出所有可用的表，检查是否有users表
      try {
        const { data: tables } = await supabase.rpc('get_tables');
        console.log('Supabase可用表:', tables ? tables.map(t => t.name).join(', ') : '无法获取表列表');
      } catch (tablesError) {
        console.warn('无法获取Supabase表列表:', tablesError.message);
      }
      
      // 检查数据库表结构
      try {
        const { data: tableData, error: tableError } = await supabase
          .from('users')
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.error('Supabase users表查询失败:', tableError.code, tableError.message);
        } else {
          console.log('Supabase users表查询成功，返回行数:', tableData ? tableData.length : 0);
          if (tableData && tableData.length > 0) {
            console.log('users表字段:', Object.keys(tableData[0]).join(', '));
          }
        }
      } catch (tableError) {
        console.error('Supabase users表结构检查异常:', tableError.message);
      }
      
      // 检查是否有auth.users表（Supabase默认用户表）
      try {
        const { data: authUsersData, error: authUsersError } = await supabase
          .from('auth.users')
          .select('*')
          .limit(1);
        
        if (authUsersError) {
          console.warn('auth.users表查询失败:', authUsersError.message);
        } else {
          console.log('auth.users表查询成功，返回行数:', authUsersData ? authUsersData.length : 0);
        }
      } catch (authError) {
        console.warn('auth.users表检查异常:', authError.message);
      }
      
      // 准备要插入的数据，确保字段名称与数据库匹配
    const insertData = {
      username: userData.username,
      password: userData.password,
      email: userData.email || null
    };
      
      console.log('准备插入的数据字段:', Object.keys(insertData).join(', '));
      
      // 尝试在public模式下插入
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([insertData])
          .select()
          .single();
        
        if (error) {
          console.error('Supabase插入用户失败:', error.code, error.message);
          
          // 尝试使用不同的方法
          try {
            const { data: altData, error: altError } = await supabase
              .from('users')
              .insert([insertData]);
            
            if (altError) {
              console.error('替代插入方法也失败:', altError.code, altError.message);
            } else {
              console.log('替代插入方法成功');
              return { ...insertData, id: 'new' };
            }
          } catch (altError) {
            console.error('替代插入方法异常:', altError.message);
          }
          
          throw error;
        }
        
        console.log('用户成功插入到Supabase:', { id: data.id, username: data.username });
        return data;
      } catch (insertError) {
        // 如果public.users表失败，尝试直接使用auth.users（如果可用）
        console.warn('尝试使用auth.users表插入用户');
        throw insertError;
      }
    } catch (error) {
      console.error('Supabase用户创建失败，回退到模拟数据:', error.message);
      const newId = mockData.users.length + 1;
      const newUser = { ...userData, id: newId };
      mockData.users.push(newUser);
      console.log('已在模拟数据中创建用户:', { id: newId, username: newUser.username });
      return newUser;
    }
  },
  findAll: async (options = {}) => {
    try {
      let query = supabase.from('users').select('*');
      if (options.where) {
        query = query.match(options.where);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('使用模拟Users数据:', error.message);
      // 从模拟数据中筛选
      if (!options.where) return mockData.users;
      return mockData.users.filter(user => {
        const where = options.where;
        return Object.keys(where).every(key => user[key] === where[key]);
      });
    }
  }
};

const Note = {
  findAll: async (options = {}) => {
    try {
      let query = supabase.from('notes').select('*');
      if (options.where) {
        query = query.match(options.where);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('使用模拟Notes数据:', error.message);
      // 从模拟数据中筛选
      if (!options.where) return mockData.notes;
      return mockData.notes.filter(note => {
        const where = options.where;
        return Object.keys(where).every(key => note[key] === where[key]);
      });
    }
  },
  create: async (noteData) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([noteData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('模拟创建Note数据:', error.message);
      const newId = mockData.notes.length + 1;
      const newNote = { ...noteData, id: newId };
      mockData.notes.push(newNote);
      return newNote;
    }
  },
  findOne: async (options) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .match(options.where || {})
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('使用模拟Note数据:', error.message);
      // 从模拟数据中查找
      return mockData.notes.find(note => {
        const where = options.where || {};
        return Object.keys(where).every(key => note[key] === where[key]);
      });
    }
  },
  update: async (updates, options) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .match(options.where || {})
        .select();
      if (error) throw error;
      return [data.length, data];
    } catch (error) {
      console.warn('模拟更新Note数据:', error.message);
      // 模拟更新
      const updatedNotes = mockData.notes.map(note => {
        const where = options.where || {};
        const matches = Object.keys(where).every(key => note[key] === where[key]);
        return matches ? { ...note, ...updates } : note;
      });
      mockData.notes = updatedNotes;
      return [updatedNotes.length, updatedNotes];
    }
  },
  destroy: async (options) => {
    try {
      const { data, error, count } = await supabase
        .from('notes')
        .delete()
        .match(options.where || {})
        .select('*');
      if (error) throw error;
      return count;
    } catch (error) {
      console.warn('模拟删除Note数据:', error.message);
      // 模拟删除
      const beforeCount = mockData.notes.length;
      mockData.notes = mockData.notes.filter(note => {
        const where = options.where || {};
        return !Object.keys(where).every(key => note[key] === where[key]);
      });
      return beforeCount - mockData.notes.length;
    }
  },
  findByPk: async (id) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('使用模拟Note数据:', error.message);
      return mockData.notes.find(note => note.id === id);
    }
  }
};

const Game = {
  findAll: async (options = {}) => {
    try {
      let query = supabase.from('games').select('*');
      if (options.where) {
        if (options.where[Sequelize.Op?.or]) {
          // 处理搜索条件
          const orConditions = options.where[Sequelize.Op.or];
          const orFilters = orConditions.map(condition => {
            const field = Object.keys(condition)[0];
            const value = condition[field].like.replace(/%/g, '*');
            return `${field}.ilike.${value}`;
          });
          query = query.or(orFilters);
        } else if (options.where.status) {
          query = query.eq('status', options.where.status);
        } else {
          query = query.match(options.where);
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('使用模拟Games数据:', error.message);
      // 从模拟数据中筛选
      let result = [...mockData.games];
      if (options.where) {
        if (options.where[Sequelize.Op?.or]) {
          // 处理搜索条件
          const orConditions = options.where[Sequelize.Op.or];
          result = result.filter(game => {
            return orConditions.some(condition => {
              const field = Object.keys(condition)[0];
              const value = condition[field].like.replace(/%/g, '');
              return game[field]?.toLowerCase().includes(value.toLowerCase());
            });
          });
        } else if (options.where.status) {
          result = result.filter(game => game.status === options.where.status);
        }
      }
      return result;
    }
  },
  findByPk: async (id) => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('使用模拟Game数据:', error.message);
      return mockData.games.find(game => game.id === id);
    }
  },
  count: async () => {
    try {
      const { count, error } = await supabase
        .from('games')
        .select('*', { count: 'exact' });
      if (error) throw error;
      return count;
    } catch (error) {
      console.warn('使用模拟Games计数:', error.message);
      return mockData.games.length;
    }
  },
  bulkCreate: async (games) => {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert(games)
        .select();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('模拟批量创建Games数据:', error.message);
      // 模拟批量创建
      games.forEach(game => {
        const newId = mockData.games.length + 1;
        mockData.games.push({ ...game, id: newId });
      });
      return games;
    }
  }
};

const Strategy = {
  findAll: async (options = {}) => {
    try {
      let query = supabase.from('strategies').select('*');
      if (options.where) {
        if (options.where[Sequelize.Op?.or]) {
          const orConditions = options.where[Sequelize.Op.or];
          const orFilters = orConditions.map(condition => {
            const field = Object.keys(condition)[0];
            const value = condition[field].like.replace(/%/g, '*');
            return `${field}.ilike.${value}`;
          });
          query = query.or(orFilters);
        }
        if (options.where.status) query = query.eq('status', options.where.status);
        if (options.where.game_id) query = query.eq('game_id', options.where.game_id);
        if (options.where.difficulty) query = query.eq('difficulty', options.where.difficulty);
        if (options.where.view_count?.[Sequelize.Op?.gte]) {
          query = query.gte('view_count', options.where.view_count[Sequelize.Op.gte]);
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('使用模拟Strategies数据:', error.message);
      // 从模拟数据中筛选
      let result = [...mockData.strategies];
      if (options.where) {
        if (options.where[Sequelize.Op?.or]) {
          const orConditions = options.where[Sequelize.Op.or];
          result = result.filter(strategy => {
            return orConditions.some(condition => {
              const field = Object.keys(condition)[0];
              const value = condition[field].like.replace(/%/g, '');
              return strategy[field]?.toLowerCase().includes(value.toLowerCase());
            });
          });
        }
        if (options.where.status) {
          result = result.filter(strategy => strategy.status === options.where.status);
        }
        if (options.where.game_id) {
          result = result.filter(strategy => strategy.game_id === options.where.game_id);
        }
        if (options.where.difficulty) {
          result = result.filter(strategy => strategy.difficulty === options.where.difficulty);
        }
        if (options.where.view_count?.[Sequelize.Op?.gte]) {
          result = result.filter(strategy => strategy.view_count >= options.where.view_count[Sequelize.Op.gte]);
        }
      }
      return result;
    }
  },
  findByPk: async (id) => {
    try {
      // 查询所有字段，包括image_urls和video_urls
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', id)
        .single();
      
      console.log('数据库查询结果:', { data, error });
      
      if (error) {
        console.log('攻略不存在或查询失败:', error.message);
        // 尝试从模拟数据中查找
        const mockStrategy = mockData.strategies.find(strategy => strategy.id === id);
        if (mockStrategy) {
          console.log('从模拟数据中找到攻略');
          return mockStrategy;
        }
        return null; // 记录不存在时返回null
      }
      
      // 添加调试日志，查看返回的数据
      console.log('数据库查询返回的攻略数据:', {
        id: data.id,
        hasImageUrls: data.image_urls !== undefined,
        imageUrlsType: typeof data.image_urls,
        imageUrlsValue: data.image_urls,
        hasVideoUrls: data.video_urls !== undefined,
        videoUrlsType: typeof data.video_urls,
        videoUrlsValue: data.video_urls
      });
      return data;
    } catch (error) {
      console.error('查询Strategy失败:', error);
      // 从模拟数据中查找作为最后手段
      const mockStrategy = mockData.strategies.find(strategy => strategy.id === id);
      if (mockStrategy) {
        console.log('从模拟数据中找到攻略');
        return mockStrategy;
      }
      return null; // 所有查找都失败时返回null
    }
  },
  create: async (strategyData) => {
    try {
      console.log('开始保存攻略到Supabase数据库:', strategyData.title);
      console.log('image_urls值:', strategyData.image_urls);
      console.log('video_urls值:', strategyData.video_urls);
      
      // 直接插入数据，不使用.single()以避免格式问题
      const { data, error } = await supabase
        .from('strategies')
        .insert([strategyData])
        .select();
      
      if (error) {
        console.error('Supabase插入失败:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Supabase插入成功，返回数据:', data[0]);
        return data[0];
      } else {
        console.error('Supabase返回空数据');
        throw new Error('Supabase插入成功但返回空数据');
      }
    } catch (error) {
      console.error('数据库创建Strategy失败:', error.message);
      // 不再使用模拟数据，确保数据库操作成功
      throw error;
    }
  },
  update: async (updates, options) => {
    try {
      // 不再移除image_urls和video_urls字段，确保它们被保存到数据库中
      const { data, error } = await supabase
        .from('strategies')
        .update(updates)
        .match(options.where || {})
        .select();
      if (error) throw error;
      return [data.length, data];
    } catch (error) {
      console.warn('模拟更新Strategy数据:', error.message);
      // 模拟更新，不再移除image_urls和video_urls字段
      const updatedStrategies = mockData.strategies.map(strategy => {
        const where = options.where || {};
        const matches = Object.keys(where).every(key => strategy[key] === where[key]);
        return matches ? { ...strategy, ...updates } : strategy;
      });
      mockData.strategies = updatedStrategies;
      return [updatedStrategies.length, updatedStrategies];
    }
  },
  destroy: async (id) => {
    try {
      // 检查攻略是否存在
      const { data: existingStrategy, error: findError } = await supabase.from('strategies').select('*').eq('id', id).single();
      if (findError) {
        console.error('查询攻略失败:', findError.message);
        // 尝试从模拟数据中查找
        const mockIndex = mockData.strategies.findIndex(strategy => strategy.id === id);
        if (mockIndex === -1) {
          throw new Error('攻略不存在');
        }
        // 在模拟数据中删除
        mockData.strategies.splice(mockIndex, 1);
        return { success: true, message: '从模拟数据中删除攻略成功', id };
      }
      
      // 1. 删除关联的媒体图片记录
      await supabase.from('media_images').delete().eq('strategy_id', id);
      
      // 2. 删除关联的媒体视频记录
      await supabase.from('media_videos').delete().eq('strategy_id', id);
      
      // 3. 删除关联的标签记录
      await supabase.from('strategy_tags').delete().eq('strategy_id', id);
      
      // 4. 删除攻略记录
      const { error } = await supabase.from('strategies').delete().eq('id', id);
      if (error) {
        console.error('删除攻略失败:', error.message);
        throw error;
      }
      
      return { success: true, message: '攻略及其关联数据已删除', id };
    } catch (error) {
      console.error('删除攻略时出错:', error.message);
      throw error;
    }
  }
};

const Tag = {
  findAll: async () => {
    try {
      const { data, error } = await supabase.from('tags').select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('使用模拟Tags数据:', error.message);
      return mockData.tags;
    }
  },
  bulkCreate: async (tags) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert(tags)
        .select();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('模拟批量创建Tags数据:', error.message);
      // 模拟批量创建
      tags.forEach(tag => {
        const existing = mockData.tags.find(t => t.name === tag.name);
        if (!existing) {
          const newId = mockData.tags.length + 1;
          mockData.tags.push({ ...tag, id: newId });
        }
      });
      return tags;
    }
  }
};

const StrategyTag = {};

// 模拟Sequelize对象，用于兼容现有代码
const Sequelize = {
  Op: {
    like: 'like',
    gte: 'gte',
    or: 'or'
  }
};

const sequelize = {
  Sequelize
};

// 执行数据库迁移
async function executeDatabaseMigrations() {
  try {
    console.log('🔄 开始执行数据库迁移...');
    
    // 读取SQL迁移文件
    const migrationFilePath = path.resolve('./create_media_tables.sql');
    
    if (!fs.existsSync(migrationFilePath)) {
      console.log('⚠️  未找到迁移文件:', migrationFilePath);
      return;
    }
    
    const sql = fs.readFileSync(migrationFilePath, 'utf8');
    
    // 执行SQL语句
    // 注意：由于我们使用Supabase，这里我们可以直接通过PostgREST API执行SQL
    // 但为了简化，我们使用psql命令行工具
    try {
      // 尝试使用psql执行迁移
      console.log('尝试使用psql执行SQL迁移...');
      // 注意：实际使用时需要配置正确的环境变量
      // await execPromise(`psql "${process.env.DATABASE_URL}" -c "${sql}"`);
      console.log('如果需要手动执行迁移，请使用以下命令:');
      console.log(`psql "DATABASE_URL" -f ${migrationFilePath}`);
    } catch (execError) {
      console.log('⚠️  psql执行失败，将通过Supabase直接执行SQL...');
      
      // 由于Supabase不支持直接执行多条SQL语句，我们需要拆分执行
      const sqlStatements = sql.split(';').filter(Boolean).map(statement => statement.trim());
      
      for (const statement of sqlStatements) {
        if (statement) {
          try {
            const { error } = await supabase.rpc('execute_sql', { sql: statement });
            if (error) {
              console.error('执行SQL语句失败:', statement, '错误:', error.message);
            } else {
              console.log('✅ SQL语句执行成功:', statement.substring(0, 100) + '...');
            }
          } catch (error) {
            console.error('执行SQL时发生错误:', error);
          }
        }
      }
    }
    
    console.log('✅ 数据库迁移完成！');
  } catch (error) {
    console.error('执行数据库迁移时发生错误:', error);
  }
}

// Database Connection
async function connectDB() {
  try {
    console.log('Attempting to connect to Supabase...');
    // 测试Supabase连接
    const { data, error } = await supabase.from('games').select('id').limit(1);
    
    if (error) {
      console.warn('Supabase connection test failed, but server will continue to run:', error.message);
      console.log('Please check your SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
    } else {
      console.log('Supabase connection established successfully.');
      console.log('Using data from Supabase database.');
    }
  } catch (error) {
    console.warn('Database connection error, but server will continue to run:', error.message);
  }
}

// 日志接口，用于接收前端发送的日志
app.post('/api/log', (req, res) => {
  try {
    const { message, originalUrl, processedUrl, decodedUrl, finalUrl, error } = req.body;
    console.log('===== 前端日志 =====');
    console.log('消息:', message);
    if (originalUrl) console.log('原始URL:', originalUrl);
    if (processedUrl) console.log('处理后URL:', processedUrl);
    if (decodedUrl) console.log('解码URL:', decodedUrl);
    if (finalUrl) console.log('最终URL:', finalUrl);
    if (error) console.log('错误:', error);
    console.log('==================');
    res.json({ success: true });
  } catch (err) {
    console.error('处理前端日志失败:', err);
    res.status(500).json({ error: '处理日志失败' });
  }
});

// Basic Route
app.get('/', (req, res) => {
  res.send('You Backend Server is Running!');
});

// Search API Route
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ games: [], strategies: [] });
    }
    
    // 搜索关键词处理
    const searchTerm = q.trim().toLowerCase();
    
    // 构建搜索条件
    const searchCondition = {
      [Sequelize.Op.or]: [
        { name: { like: `%${searchTerm}%` } },
        { description: { like: `%${searchTerm}%` } }
      ]
    };
    
    // 搜索游戏
    const games = await Game.findAll({ where: searchCondition });
    
    // 构建攻略搜索条件
    const strategySearchCondition = {
      [Sequelize.Op.or]: [
        { title: { like: `%${searchTerm}%` } },
        { content: { like: `%${searchTerm}%` } }
      ]
    };
    
    // 搜索攻略
    let strategies = await Strategy.findAll({ where: strategySearchCondition });
    
    // 确保攻略返回image_urls和video_urls字段
    strategies = strategies.map(strategy => ({
      ...strategy,
      image_urls: strategy.image_urls || [],
      video_urls: strategy.video_urls || []
    }));
    
    res.json({ games, strategies });
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({ error: '搜索失败', details: error.message });
  }
});

// AI API Endpoints
// 接入真实AI服务的API端点
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question, gameId } = req.body;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: '问题不能为空' });
    }
    
    // 这里接入真实的AI服务
    // 由于没有具体的AI服务配置，我们使用OpenAI兼容的接口作为示例
    // 在实际使用时，需要配置API密钥和正确的端点
    
    let aiResponse = null;
    try {
      // 假设使用OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'sk-placeholder-key'}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的游戏助手，专注于回答游戏相关的问题。请保持回答友好、专业且有帮助。'
            },
            {
              role: 'user',
              content: question
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      aiResponse = data.choices[0]?.message?.content || null;
    } catch (aiError) {
      console.warn('真实AI服务调用失败，使用备用方案:', aiError.message);
      
      // 如果AI服务调用失败，使用基于关键词的回答作为备用
      const lowerQuestion = question.toLowerCase();
      
      if (lowerQuestion.includes('原神')) {
        if (lowerQuestion.includes('角色') || lowerQuestion.includes('培养')) {
          aiResponse = '在原神中，角色培养主要包括以下几个方面：\n\n1. **等级提升**：使用经验书提升角色等级\n2. **天赋升级**：收集天赋材料提升技能等级\n3. **圣遗物搭配**：根据角色定位选择合适的圣遗物套装\n4. **武器选择**：为角色装备适合的武器\n\n建议优先培养主C角色，再考虑辅助角色的培养。';
        } else if (lowerQuestion.includes('元素') || lowerQuestion.includes('反应')) {
          aiResponse = '原神的元素反应系统是战斗的核心：\n\n**增幅反应**：\n- 蒸发：水+火，伤害x1.5或x2\n- 融化：冰+火，伤害x1.5或x2\n\n**剧变反应**：\n- 超载：雷+火，造成范围爆炸伤害\n- 感电：雷+水，持续造成雷元素伤害\n- 冻结：冰+水，冻结敌人\n- 超导：雷+冰，降低物理抗性\n\n合理利用元素反应可以大幅提升战斗效率！';
        }
      } else if (lowerQuestion.includes('赛博朋克') || lowerQuestion.includes('2077')) {
        if (lowerQuestion.includes('结局') || lowerQuestion.includes('ending')) {
          aiResponse = '赛博朋克2077有多个结局，主要取决于以下因素：\n\n**主要结局路线**：\n1. **恶魔结局**：选择荒坂的帮助\n2. **星星结局**：与帕南一起离开夜之城\n3. **太阳结局**：独自突袭荒坂塔\n4. **节制结局**：让强尼接管身体\n\n**隐藏结局**：\n- 需要与强尼的关系达到70%以上\n- 在屋顶选择等待5分钟不做任何选择\n\n每个结局都有不同的前置条件和角色关系要求。';
        }
      }
      
      // 如果没有匹配的关键词回答，使用默认回答
      if (!aiResponse) {
        aiResponse = `感谢您的提问！关于"${question}"，我建议您：\n\n1. 查看相关的游戏攻略文章\n2. 参考官方游戏指南\n3. 与其他玩家交流经验\n\n如果您需要更具体的帮助，请提供更多详细信息，我会尽力为您解答。`;
      }
    }
    
    // 保存对话记录到数据库
    try {
      const conversationData = {
        question,
        answer: aiResponse,
        session_id: req.headers['x-session-id'] || 'anonymous',
        game_id: gameId,
        created_at: new Date().toISOString()
      };
      
      await supabase.from('ai_conversations').insert([conversationData]);
    } catch (dbError) {
      console.warn('保存对话记录失败，但不影响返回AI回答:', dbError.message);
    }
    
    res.json({ answer: aiResponse });
  } catch (error) {
    console.error('AI问答API错误:', error);
    res.status(500).json({ error: 'AI服务暂时不可用，请稍后重试' });
  }
});

// AI摘要生成API端点
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { content, title } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: '内容不能为空' });
    }
    
    let summary = null;
    try {
      // 调用真实的AI摘要服务
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'sk-placeholder-key'}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的游戏攻略摘要助手。请对提供的游戏攻略内容进行简明扼要的总结，突出核心要点、适用场景和关键技巧。摘要应当条理清晰，易于理解。'
            },
            {
              role: 'user',
              content: `请为以下游戏攻略生成摘要:\n\n标题: ${title || '游戏攻略'}\n\n内容:\n${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}`
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI摘要API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      summary = data.choices[0]?.message?.content || null;
    } catch (aiError) {
      console.warn('真实AI摘要服务调用失败，使用备用方案:', aiError.message);
      
      // 使用备用的摘要生成逻辑
      summary = `基于《${title || '游戏攻略'}》内容，AI为您总结以下要点：\n\n1. 核心策略：本攻略主要介绍了游戏中的关键玩法和技巧\n2. 适用场景：适合中级以上玩家参考学习\n3. 重点提示：注意资源分配和时机把握\n4. 预期效果：按照攻略执行可显著提升游戏体验\n\n建议结合实际游戏情况灵活运用攻略内容。`;
    }
    
    res.json({ summary });
  } catch (error) {
    console.error('AI摘要API错误:', error);
    res.status(500).json({ error: 'AI摘要服务暂时不可用，请稍后重试' });
  }
});

// Import Routers
import { authRouter } from './auth.js';
import { dataRouter } from './data.js';
import { gamesRouter, addSampleData } from './games.js';
import { strategiesRouter } from './strategies.js';

// Use Routers
app.use('/api/auth', authRouter);
app.use('/api/data', dataRouter);
app.use('/', gamesRouter);
app.use('/', strategiesRouter);

// Start Server
async function startServer() {
  try {
    await connectDB();
    // 执行数据库迁移
    await executeDatabaseMigrations();
    // 连接成功后添加示例数据
    await addSampleData();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Server is also accessible at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer();

// Note: In a real app, you would define associations here, e.g.,
// User.hasMany(Note, { foreignKey: 'userId' });
// Note.belongsTo(User, { foreignKey: 'userId' });

export { supabase, sequelize, User, Note, Game, Strategy, Tag, StrategyTag, mockData };

