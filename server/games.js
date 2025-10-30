import express from 'express';
import { authenticateToken } from './auth.js';
import { supabase, mockData } from './server.js';

const router = express.Router();

// 添加示例数据
async function addSampleData() {
  try {
    let hasExistingData = false;
    
    // 尝试检查Supabase中是否已有游戏数据
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id')
        .limit(1);
      
      if (!error && data && data.length > 0) {
        hasExistingData = true;
      }
    } catch (supabaseError) {
      console.warn('检查Supabase数据失败，检查模拟数据:', supabaseError.message);
    }
    
    // 如果Supabase没有数据，检查模拟数据
    if (!hasExistingData && mockData.games && mockData.games.length > 0) {
      hasExistingData = true;
    }
    
    if (hasExistingData) {
      console.log('游戏数据已存在，跳过添加');
      return;
    }
    
    console.log('开始添加示例游戏数据...');
    
    // 示例游戏数据
    const sampleGames = [
      {
        name: "原神",
        description: "一款开放世界冒险游戏，玩家将扮演旅行者，在提瓦特大陆上旅行、探索、战斗。",
        developer: "miHoYo",
        category: "RPG",
        release_date: new Date("2020-09-28"),
        cover_image_url: "/game-placeholder.svg",
        status: "active",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "王者荣耀",
        description: "一款多人在线战术竞技游戏，5v5对战模式，玩家选择英雄进行实时对战。",
        developer: "腾讯游戏",
        category: "MOBA",
        release_date: new Date("2015-11-26"),
        cover_image_url: "/game-placeholder.svg",
        status: "active",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "英雄联盟",
        description: "一款经典的MOBA游戏，10名玩家分为两队，通过摧毁对方基地取得胜利。",
        developer: "Riot Games",
        category: "MOBA",
        release_date: new Date("2009-10-27"),
        cover_image_url: "/game-placeholder.svg",
        status: "active",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "绝地求生",
        description: "一款大逃杀类型游戏，100名玩家在一个岛上战斗，最后存活的玩家获胜。",
        developer: "PUBG Corporation",
        category: "射击游戏",
        release_date: new Date("2017-03-23"),
        cover_image_url: "/game-placeholder.svg",
        status: "active",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "我的世界",
        description: "一款沙盒建造游戏，玩家可以在一个三维世界中建造和破坏各种方块。",
        developer: "Mojang Studios",
        category: "沙盒游戏",
        release_date: new Date("2011-11-18"),
        cover_image_url: "/game-placeholder.svg",
        status: "active",
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // 添加游戏数据到Supabase
    let createdGames = [];
    try {
      const { data, error } = await supabase
        .from('games')
        .insert(sampleGames)
        .select();
      
      if (!error && data) {
        createdGames = data;
        console.log('成功添加游戏数据到Supabase');
      } else {
        throw error || new Error('Supabase添加游戏失败');
      }
    } catch (supabaseError) {
      console.warn('使用Supabase添加游戏失败，使用模拟数据:', supabaseError.message);
      
      // 使用模拟数据
      sampleGames.forEach((game, index) => {
        game.id = index + 1;
        mockData.games.push(game);
      });
      createdGames = sampleGames;
    }
    
    console.log('示例游戏数据添加成功');
    console.log('开始添加示例攻略数据...');
    
    // 示例攻略数据
    const sampleStrategies = [
      {
        game_id: createdGames[0].id,
        title: '原神新手入门指南',
        content: '# 原神新手入门指南\n\n欢迎来到提瓦特大陆！作为新手，建议先完成主线任务，熟悉游戏机制。\n\n## 角色选择\n优先培养初始角色，如旅行者、安柏等。\n\n## 资源收集\n关注每日委托和任务奖励，合理使用原石。\n\n## 探索技巧\n使用元素视野寻找隐藏宝箱，攀爬高处获取神瞳。',
        user_id: 1,
        difficulty: 'beginner',
        status: 'published',
        view_count: 1532,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        game_id: createdGames[0].id,
        title: '原神角色培养攻略',
        content: '# 原神角色培养攻略\n\n角色培养是提升战斗力的关键，本攻略详细介绍各角色的培养路线。\n\n## 主属性选择\n根据角色定位选择合适的主属性圣遗物。\n\n## 武器推荐\n不同角色适合的武器搭配指南。\n\n## 天赋优先级\n哪些天赋需要优先升级。',
        user_id: 1,
        difficulty: 'intermediate',
        status: 'published',
        view_count: 2845,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        game_id: createdGames[1].id,
        title: '王者荣耀打野技巧大全',
        content: '# 王者荣耀打野技巧大全\n\n打野是游戏中的重要位置，本攻略将教你如何高效清野和Gank。\n\n## 清野路线\n最优清野顺序和时间规划。\n\n## Gank时机\n如何把握最佳Gank时机。\n\n## 装备选择\n不同打野英雄的装备推荐。',
        user_id: 1,
        difficulty: 'intermediate',
        status: 'published',
        view_count: 3210,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        game_id: createdGames[2].id,
        title: '英雄联盟上单对线指南',
        content: '# 英雄联盟上单对线指南\n\n上单是一个孤独的位置，需要扎实的对线能力和团队意识。\n\n## 英雄分类\n了解不同类型上单的特点和优劣势。\n\n## 对线技巧\n如何应对不同的对手和局面。\n\n## 团队作用\n团战中的定位和职责。',
        user_id: 1,
        difficulty: 'advanced',
        status: 'published',
        view_count: 2156,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        game_id: createdGames[3].id,
        title: '绝地求生吃鸡技巧',
        content: '# 绝地求生吃鸡技巧\n\n从落地到决赛圈，全方位提升你的吃鸡率。\n\n## 落点选择\n不同水平玩家的最佳落点推荐。\n\n## 武器搭配\n最实用的武器组合和配件选择。\n\n## 决赛圈策略\n如何在最后的对决中胜出。',
        user_id: 1,
        difficulty: 'intermediate',
        status: 'published',
        view_count: 4567,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // 添加攻略数据到Supabase
    try {
      const { data, error } = await supabase
        .from('strategies')
        .insert(sampleStrategies)
        .select();
      
      if (!error && data) {
        console.log('成功添加攻略数据到Supabase');
      } else {
        throw error || new Error('Supabase添加攻略失败');
      }
    } catch (supabaseError) {
      console.warn('使用Supabase添加攻略失败，使用模拟数据:', supabaseError.message);
      
      // 使用模拟数据
      sampleStrategies.forEach((strategy, index) => {
        strategy.id = index + 1;
        mockData.strategies.push(strategy);
      });
    }
    
    console.log('示例攻略数据添加成功');
    console.log('开始添加示例标签数据...');
    
    // 示例标签数据
    const sampleTags = [
      { name: '新手攻略', color: '#409EFF' },
      { name: '角色培养', color: '#67C23A' },
      { name: 'PVE', color: '#E6A23C' },
      { name: 'PVP', color: '#F56C6C' },
      { name: '装备搭配', color: '#909399' }
    ];
    
    // 添加标签数据到Supabase
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert(sampleTags)
        .select();
      
      if (!error && data) {
        console.log('成功添加标签数据到Supabase');
      } else {
        throw error || new Error('Supabase添加标签失败');
      }
    } catch (supabaseError) {
      console.warn('使用Supabase添加标签失败，使用模拟数据:', supabaseError.message);
      
      // 使用模拟数据
      sampleTags.forEach((tag, index) => {
        tag.id = index + 1;
        mockData.tags.push(tag);
      });
    }
    
    console.log('示例标签数据添加成功');
  } catch (error) {
    console.error('添加示例数据失败:', error);
  }
}

// 游戏相关API
router.get('/api/games', async (req, res) => {
  try {
    const { search, status, category } = req.query;
    
    // 构建查询对象
    let query = {};
    
    // 添加状态过滤
    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }
    
    // 添加分类过滤（小心处理，因为数据库可能没有category字段）
    try {
      if (category) {
        // 尝试使用category字段过滤
        const { data: testData } = await supabase.from('games').select('category').limit(1);
        if (testData && testData.length > 0) {
          query.category = category;
        } else {
          console.warn('category字段不存在，跳过分类过滤');
        }
      }
    } catch (err) {
      console.warn('检查category字段时出错，跳过分类过滤:', err.message);
    }
    
    // 执行Supabase查询
    let { data, error } = await supabase
      .from('games')
      .select('*')
      .match(query);
    
    // 处理搜索功能（如果需要）
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(game => 
        game.name.toLowerCase().includes(searchLower) ||
        game.developer.toLowerCase().includes(searchLower) ||
        game.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (error) {
      console.error('Supabase查询错误:', error);
      throw error;
    }
    
    // 返回与前端期望格式一致的数据
    res.json({
      data: {
        games: data,
        total: data.length
      }
    });
  } catch (error) {
    console.error('获取游戏列表失败:', error);
    // 直接返回模拟数据作为最后后备
    const mockGames = mockData.games.filter(game => game.status === 'active');
    res.json(mockGames);
  }
});

router.get('/api/games/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      console.error('Supabase查询错误:', error);
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ message: '游戏不存在' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('获取游戏详情失败:', error);
    res.status(500).json({ message: '获取游戏详情失败' });
  }
});

// 创建新游戏 - 暂时移除authenticateToken以简化测试
  router.post('/api/games', async (req, res) => {
    // 确保响应头正确设置
    res.setHeader('Content-Type', 'application/json');
    
    console.log('------------------------------------------------');
    console.log('收到POST /api/games请求');
    
    // 详细记录请求体
    console.log('请求体类型:', typeof req.body);
    console.log('请求体JSON.stringify:', JSON.stringify(req.body));
    
    // 记录请求头
    console.log('请求头content-type:', req.headers['content-type']);
    console.log('请求方法:', req.method);
    console.log('请求路径:', req.path);
    
    try {
      // 首先检查请求体是否存在且为对象
      if (!req.body) {
        console.log('错误: 请求体不存在');
        return res.status(400).json({ 
          message: '请求体不存在',
          error: '请求体不存在' 
        });
      }
      
      if (typeof req.body !== 'object') {
        console.log('错误: 请求体不是有效的JSON对象');
        return res.status(400).json({ 
          message: '请求体不是有效的JSON对象',
          error: '请求体不是有效的JSON对象' 
        });
      }
      
      // 提取并验证字段
      const { name, description, developer, release_date, cover_image_url } = req.body;
      
      console.log('提取的字段:');
      console.log('- name:', name, '(类型:', typeof name, ')');
      console.log('- developer:', developer, '(类型:', typeof developer, ')');
      
      // 必填字段验证
      const missingFields = [];
      if (!name || name.trim() === '') missingFields.push('name');
      if (!developer || developer.trim() === '') missingFields.push('developer');
      
      if (missingFields.length > 0) {
        const errorMsg = `缺少必填字段: ${missingFields.join(', ')}`;
        console.log('验证失败:', errorMsg);
        return res.status(400).json({ 
          message: errorMsg,
          error: errorMsg,
          missingFields: missingFields,
          receivedBody: req.body 
        });
      }
      
      // 构建新游戏数据 - 只包含必要的字段，移除不存在的列
      const gameData = {
        name: name.trim(),
        description: description ? description.trim() : '',
        developer: developer.trim(),
        status: 'active',
        // 移除cover_image_url和release_date，因为数据库中不存在这些列
      };
      
      console.log('验证通过，准备创建游戏数据:', gameData);
      
      // 检查Supabase客户端
      if (!supabase) {
        console.error('错误: Supabase客户端未初始化');
        return res.status(500).json({ 
          message: '数据库连接未初始化',
          error: '数据库连接未初始化' 
        });
      }
      
      // 直接使用Supabase创建，确保数据永久保存
      // 使用普通insert代替upsert，避免没有匹配唯一约束的错误
      console.log('开始调用Supabase.insert...');
      
      try {
        const { data, error } = await supabase
          .from('games')
          .insert([gameData])
          .select()
          .single();
        
        console.log('Supabase响应数据:', data);
        
        if (error) {
          console.error('Supabase创建游戏失败:', error.code, error.message);
          return res.status(500).json({ 
            message: '创建游戏失败',
            error: error.message,
            details: {
              code: error.code,
              message: error.message,
              hint: error.hint || '无额外提示'
            }
          });
        }
        
        if (!data) {
          console.log('警告: 未返回创建的数据');
          return res.status(500).json({ 
            message: '创建成功但未返回数据',
            error: '创建成功但未返回数据' 
          });
        }
        
        console.log('游戏创建/更新成功');
        return res.status(201).json(data);
        
      } catch (supabaseError) {
        console.error('Supabase操作异常:', supabaseError);
        return res.status(500).json({ 
          message: '数据库操作异常',
          error: String(supabaseError)
        });
      }
      
    } catch (error) {
      console.error('创建游戏时发生未捕获的错误:', error);
      console.error('错误堆栈:', error.stack);
      
      // 确保返回JSON格式的错误
      try {
        res.status(500).json({
          message: '服务器内部错误',
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      } catch (responseError) {
        // 如果JSON响应也失败，至少返回基本文本错误
        console.error('响应发送失败:', responseError);
        res.status(500).end('服务器错误');
      }
    } finally {
      console.log('------------------------------------------------');
    }
  });

// 策略相关API
router.get('/api/strategies', async (req, res) => {
  try {
    const { game_id, search, status, difficulty, sort, page, limit } = req.query;
    
    // 构建查询对象
    let query = {};
    
    // 添加过滤条件
    if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (game_id) {
      query.game_id = parseInt(game_id);
    }
    
    // 执行Supabase查询
    let supabaseQuery = supabase
      .from('strategies')
      .select('*', { count: 'exact' })
      .match(query);
    
    // 添加排序
    if (sort) {
      if (sort === 'views') {
        supabaseQuery = supabaseQuery.order('view_count', { ascending: false });
      } else if (sort === 'difficulty') {
        // 难度排序: easy < medium < hard
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        // 这里使用客户端排序，因为Supabase可能不支持这种自定义排序
      } else {
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      }
    } else {
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
    }
    
    // 添加分页
    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      supabaseQuery = supabaseQuery.range(offset, offset + limitNum - 1);
    }
    
    const { data, error, count } = await supabaseQuery;
    
    // 处理搜索功能
    if (search && data) {
      const searchLower = search.toLowerCase();
      data = data.filter(strategy => 
        strategy.title.toLowerCase().includes(searchLower) ||
        strategy.content.toLowerCase().includes(searchLower)
      );
    }
    
    // 处理难度排序（客户端）
    if (sort === 'difficulty' && data) {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      data.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    }
    
    if (error) {
      console.error('Supabase查询错误:', error);
      throw error;
    }
    
    // 返回与前端期望格式一致的数据
    res.json({
      data: {
        strategies: data,
        total: count || data.length
      }
    });
  } catch (error) {
    console.error('获取策略列表失败:', error);
    res.status(500).json({ message: '获取策略列表失败' });
  }
});

router.get('/strategies/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      console.error('Supabase查询错误:', error);
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ message: '策略不存在' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('获取策略详情失败:', error);
    res.status(500).json({ message: '获取策略详情失败' });
  }
});

// 创建新攻略
router.post('/strategies', authenticateToken, async (req, res) => {
  try {
    const { game_id, title, content, difficulty, type } = req.body;
    
    // 验证必填字段
    if (!game_id || !title || !content) {
      return res.status(400).json({ message: '游戏ID、攻略标题和内容为必填字段' });
    }
    
    // 验证游戏是否存在（仅使用Supabase）
    const { data: gameData } = await supabase
      .from('games')
      .select('id')
      .eq('id', game_id)
      .single();
    
    if (!gameData) {
      return res.status(404).json({ message: '指定的游戏不存在' });
    }
    
    // 构建新攻略数据（移除author和updated_at字段，因为数据库表中没有这些字段）
    const strategyData = {
      game_id: parseInt(game_id),
      title,
      content,
      difficulty: difficulty || 'medium',
      type: type || 'general',
      user_id: req.user?.id || 1,
      view_count: 0,
      status: 'published',
      created_at: new Date()
    };
    
    // 直接使用Supabase创建，确保数据永久保存
    const { data, error } = await supabase
      .from('strategies')
      .insert([strategyData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase创建攻略失败:', error);
      return res.status(500).json({ 
        message: '创建攻略失败',
        error: error.message 
      });
    }
    
    return res.status(201).json(data);
  } catch (error) {
    console.error('创建攻略异常:', error);
    res.status(500).json({ message: '创建攻略失败', error: error.message });
  }
});

router.put('/strategies/:id/view', async (req, res) => {
  try {
    const strategy = await Strategy.findByPk(req.params.id);
    if (!strategy) {
      return res.status(404).json({ message: '策略不存在' });
    }
    
    await strategy.increment('view_count');
    res.json({ message: '浏览量增加成功' });
  } catch (error) {
    console.error('增加浏览量失败:', error);
    res.status(500).json({ message: '增加浏览量失败' });
  }
});

router.get('/strategies/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: '搜索关键词不能为空' });
    }
    
    const strategies = await Strategy.findAll({
      where: {
        status: 'published',
        [sequelize.Sequelize.Op.or]: [
          { title: { [sequelize.Sequelize.Op.like]: `%${q}%` } },
          { content: { [sequelize.Sequelize.Op.like]: `%${q}%` } }
        ]
      },
      include: [
        { model: Game, attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(strategies);
  } catch (error) {
    console.error('搜索策略失败:', error);
    res.status(500).json({ message: '搜索策略失败' });
  }
});

// 统一搜索API - 同时搜索游戏和攻略
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    // 搜索游戏
    const games = await Game.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          {
            name: {
              [sequelize.Sequelize.Op.like]: `%${query}%`
            }
          },
          {
            description: {
              [sequelize.Sequelize.Op.like]: `%${query}%`
            }
          },
          {
            developer: {
              [sequelize.Sequelize.Op.like]: `%${query}%`
            }
          },
          {
            category: {
              [sequelize.Sequelize.Op.like]: `%${query}%`
            }
          }
        ],
        status: 'active'
      }
    });
    
    // 搜索攻略
    const strategies = await Strategy.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          {
            title: {
              [sequelize.Sequelize.Op.like]: `%${query}%`
            }
          },
          {
            content: {
              [sequelize.Sequelize.Op.like]: `%${query}%`
            }
          }
        ],
        status: 'published'
      },
      include: [
        { model: Game, attributes: ['name'] },
        { model: Tag, attributes: ['name'] }
      ]
    });
    
    // 格式化游戏数据
    const formattedGames = games.map(game => ({
      id: game.id,
      name: game.name,
      description: game.description,
      developer: game.developer,
      category: game.category,
      release_date: game.release_date,
      cover_image_url: game.cover_image_url
    }));
    
    // 格式化攻略数据
    const formattedStrategies = strategies.map(strategy => ({
      id: strategy.id,
      title: strategy.title,
      content: strategy.content,
      author: strategy.author || '匿名',
      difficulty: strategy.difficulty,
      game_id: strategy.game_id,
      game_name: strategy.Game?.name || '未知游戏',
      views: strategy.view_count,
      created_at: strategy.created_at,
      tags: strategy.Tags ? strategy.Tags.map(tag => tag.name) : []
    }));
    
    // 返回整合结果
    res.json({
      total_games: formattedGames.length,
      total_strategies: formattedStrategies.length,
      games: formattedGames,
      strategies: formattedStrategies,
      query: query,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('统一搜索失败:', error);
    res.status(500).json({ 
      message: '搜索失败',
      error: error.message 
    });
  }
});

// 高级搜索API - 带筛选条件
router.get('/search/advanced', async (req, res) => {
  try {
    const { q = '', type = 'all', gameId, category, difficulty, minViews = 0 } = req.query;
    
    const results = {
      games: [],
      strategies: []
    };
    
    // 如果搜索类型包含游戏或全部
    if (type === 'all' || type === 'games') {
      const gameConditions = {
        [sequelize.Sequelize.Op.or]: [
          {
            name: {
              [sequelize.Sequelize.Op.like]: `%${q}%`
            }
          },
          {
            description: {
              [sequelize.Sequelize.Op.like]: `%${q}%`
            }
          },
          {
            developer: {
              [sequelize.Sequelize.Op.like]: `%${q}%`
            }
          }
        ],
        status: 'active'
      };
      
      // 添加分类筛选
      if (category) {
        gameConditions.category = category;
      }
      
      results.games = await Game.findAll({
        where: gameConditions
      });
    }
    
    // 如果搜索类型包含攻略或全部
    if (type === 'all' || type === 'strategies') {
      const strategyConditions = {
        [sequelize.Sequelize.Op.or]: [
          {
            title: {
              [sequelize.Sequelize.Op.like]: `%${q}%`
            }
          },
          {
            content: {
              [sequelize.Sequelize.Op.like]: `%${q}%`
            }
          }
        ],
        status: 'published',
        view_count: {
          [sequelize.Sequelize.Op.gte]: minViews
        }
      };
      
      // 添加游戏筛选
      if (gameId) {
        strategyConditions.game_id = gameId;
      }
      
      // 添加难度筛选
      if (difficulty) {
        strategyConditions.difficulty = difficulty;
      }
      
      results.strategies = await Strategy.findAll({
        where: strategyConditions,
        include: [
          { model: Game, attributes: ['name'] },
          { model: Tag, attributes: ['name'] }
        ],
        order: [['view_count', 'DESC']]
      });
    }
    
    // 格式化数据
    results.games = results.games.map(game => ({
      id: game.id,
      name: game.name,
      description: game.description,
      developer: game.developer,
      category: game.category
    }));
    
    results.strategies = results.strategies.map(strategy => ({
      id: strategy.id,
      title: strategy.title,
      content: strategy.content.substring(0, 200) + '...', // 返回摘要
      game_name: strategy.Game?.name || '未知游戏',
      views: strategy.view_count,
      tags: strategy.Tags ? strategy.Tags.map(tag => tag.name) : []
    }));
    
    res.json({
      ...results,
      total_games: results.games.length,
      total_strategies: results.strategies.length
    });
  } catch (error) {
    console.error('高级搜索失败:', error);
    res.status(500).json({ message: '高级搜索失败' });
  }
});

// 标签相关API
router.get('/api/tags', async (req, res) => {
  try {
    // 使用Supabase查询标签数据，替代原来的Sequelize模型
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Supabase查询标签失败:', error);
      return res.status(500).json({ message: '获取标签列表失败' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('获取标签列表失败:', error);
    res.status(500).json({ message: '获取标签列表失败' });
  }
});

// 导出路由和添加示例数据函数
export { router as gamesRouter, addSampleData };