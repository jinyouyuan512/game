// you/server/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), '../uploads');
const imagesDir = path.join(uploadDir, 'images');
const videosDir = path.join(uploadDir, 'videos');

[uploadDir, imagesDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 配置静态文件服务
app.use('/uploads', express.static(uploadDir));
console.log(`静态文件服务配置完成，路径: /uploads -> ${uploadDir}`);

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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .match(options.where || {})
        .single();
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('模拟创建User数据:', error.message);
      const newId = mockData.users.length + 1;
      const newUser = { ...userData, id: newId };
      mockData.users.push(newUser);
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
      // 移除不存在的字段
      const { data, error } = await supabase
        .from('strategies')
        .select('id, title, content, difficulty, type, game_id, user_id, view_count, status, created_at')
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
      // 不再移除image_urls和video_urls字段，确保它们被保存到数据库中
      const { data, error } = await supabase
        .from('strategies')
        .insert([strategyData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('模拟创建Strategy数据:', error.message);
      const newId = mockData.strategies.length + 1;
      // 不再移除image_urls和video_urls字段
      const newStrategy = { 
        ...strategyData, 
        id: newId
      };
      mockData.strategies.push(newStrategy);
      return newStrategy;
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

// Basic Route
app.get('/', (req, res) => {
  res.send('You Backend Server is Running!');
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

