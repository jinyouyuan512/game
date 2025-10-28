import express from 'express';
import { authenticateToken } from './auth.js';
import { sequelize, Game, Strategy, Tag, StrategyTag } from './server.js';

const router = express.Router();

// 添加示例数据
async function addSampleData() {
  try {
    // 检查是否已有游戏数据
    const gameCount = await Game.count();
    if (gameCount > 0) {
      console.log('游戏数据已存在，跳过添加');
      return;
    }
    
    console.log('开始添加示例游戏数据...');
    
    // 创建示例游戏
    const games = await Game.bulkCreate([
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
    ]);
    
    console.log('示例游戏数据添加成功');
    console.log('开始添加示例攻略数据...');
    
    // 创建示例攻略
    await Promise.all([
      Strategy.create({
        game_id: games[0].id,
        title: '原神新手入门指南',
        content: '# 原神新手入门指南\n\n欢迎来到提瓦特大陆！作为新手，建议先完成主线任务，熟悉游戏机制。\n\n## 角色选择\n优先培养初始角色，如旅行者、安柏等。\n\n## 资源收集\n关注每日委托和任务奖励，合理使用原石。\n\n## 探索技巧\n使用元素视野寻找隐藏宝箱，攀爬高处获取神瞳。',
        user_id: 1,
        difficulty: 'beginner',
        status: 'published',
        view_count: 1532,
        created_at: new Date(),
        updated_at: new Date()
      }),
      Strategy.create({
        game_id: games[0].id,
        title: '原神角色培养攻略',
        content: '# 原神角色培养攻略\n\n角色培养是提升战斗力的关键，本攻略详细介绍各角色的培养路线。\n\n## 主属性选择\n根据角色定位选择合适的主属性圣遗物。\n\n## 武器推荐\n不同角色适合的武器搭配指南。\n\n## 天赋优先级\n哪些天赋需要优先升级。',
        user_id: 1,
        difficulty: 'intermediate',
        status: 'published',
        view_count: 2845,
        created_at: new Date(),
        updated_at: new Date()
      }),
      Strategy.create({
        game_id: games[1].id,
        title: '王者荣耀打野技巧大全',
        content: '# 王者荣耀打野技巧大全\n\n打野是游戏中的重要位置，本攻略将教你如何高效清野和Gank。\n\n## 清野路线\n最优清野顺序和时间规划。\n\n## Gank时机\n如何把握最佳Gank时机。\n\n## 装备选择\n不同打野英雄的装备推荐。',
        user_id: 1,
        difficulty: 'intermediate',
        status: 'published',
        view_count: 3210,
        created_at: new Date(),
        updated_at: new Date()
      }),
      Strategy.create({
        game_id: games[2].id,
        title: '英雄联盟上单对线指南',
        content: '# 英雄联盟上单对线指南\n\n上单是一个孤独的位置，需要扎实的对线能力和团队意识。\n\n## 英雄分类\n了解不同类型上单的特点和优劣势。\n\n## 对线技巧\n如何应对不同的对手和局面。\n\n## 团队作用\n团战中的定位和职责。',
        user_id: 1,
        difficulty: 'advanced',
        status: 'published',
        view_count: 2156,
        created_at: new Date(),
        updated_at: new Date()
      }),
      Strategy.create({
        game_id: games[3].id,
        title: '绝地求生吃鸡技巧',
        content: '# 绝地求生吃鸡技巧\n\n从落地到决赛圈，全方位提升你的吃鸡率。\n\n## 落点选择\n不同水平玩家的最佳落点推荐。\n\n## 武器搭配\n最实用的武器组合和配件选择。\n\n## 决赛圈策略\n如何在最后的对决中胜出。',
        user_id: 1,
        difficulty: 'intermediate',
        status: 'published',
        view_count: 4567,
        created_at: new Date(),
        updated_at: new Date()
      })
    ]);
    
    console.log('示例攻略数据添加成功');
    
    // 添加标签
    const tags = await Tag.bulkCreate([
      { name: '新手攻略', color: '#409EFF' },
      { name: '角色培养', color: '#67C23A' },
      { name: 'PVE', color: '#E6A23C' },
      { name: 'PVP', color: '#F56C6C' },
      { name: '装备搭配', color: '#909399' }
    ]);
    
    console.log('示例标签数据添加成功');
  } catch (error) {
    console.error('添加示例数据失败:', error);
  }
}

// 游戏相关API
router.get('/games', async (req, res) => {
  try {
    const { search, status } = req.query;
    const whereCondition = {};
    
    if (status) {
      whereCondition.status = status;
    } else {
      whereCondition.status = 'active';
    }
    
    if (search) {
      whereCondition[sequelize.Sequelize.Op.or] = [
        { name: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
        { description: { [sequelize.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    const games = await Game.findAll({
      where: whereCondition,
      order: [['created_at', 'DESC']]
    });
    res.json(games);
  } catch (error) {
    console.error('获取游戏列表失败:', error);
    res.status(500).json({ message: '获取游戏列表失败' });
  }
});

router.get('/games/:id', async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ message: '游戏不存在' });
    }
    res.json(game);
  } catch (error) {
    console.error('获取游戏详情失败:', error);
    res.status(500).json({ message: '获取游戏详情失败' });
  }
});

// 创建新游戏
router.post('/games', authenticateToken, async (req, res) => {
  try {
    const { name, description, developer, category, release_date, cover_image_url } = req.body;
    
    // 验证必填字段
    if (!name || !developer || !category) {
      return res.status(400).json({ message: '游戏名称、开发商和分类为必填字段' });
    }
    
    const newGame = await Game.create({
      name,
      description,
      developer,
      category,
      release_date: release_date ? new Date(release_date) : null,
      cover_image_url,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.status(201).json(newGame);
  } catch (error) {
    console.error('创建游戏失败:', error);
    res.status(500).json({ message: '创建游戏失败' });
  }
});

// 策略相关API
router.get('/strategies', async (req, res) => {
  try {
    const { gameId, search, status } = req.query;
    const whereCondition = {};
    
    if (status) {
      whereCondition.status = status;
    } else {
      whereCondition.status = 'published';
    }
    
    if (gameId) {
      whereCondition.game_id = gameId;
    }
    
    if (search) {
      whereCondition[sequelize.Sequelize.Op.or] = [
        { title: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
        { content: { [sequelize.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    const strategies = await Strategy.findAll({
      where: whereCondition,
      include: [
        { model: Game, attributes: ['name'] },
        { model: Tag, attributes: ['name', 'color'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // 格式化数据，添加game_name字段 - 兼容Supabase返回的普通对象格式
    const formattedStrategies = strategies.map(strategy => {
      // 对于Supabase返回的对象，直接使用
      return {
        ...strategy,
        game_name: strategy.Game ? strategy.Game.name : '未知游戏'
      };
    });
    
    res.json(formattedStrategies);
  } catch (error) {
    console.error('获取策略列表失败:', error);
    res.status(500).json({ message: '获取策略列表失败' });
  }
});

router.get('/strategies/:id', async (req, res) => {
  try {
    const strategy = await Strategy.findByPk(req.params.id, {
      include: [
        { model: Game, attributes: ['name', 'description'] },
        { model: Tag, attributes: ['name', 'color'] }
      ]
    });
    
    if (!strategy) {
      return res.status(404).json({ message: '策略不存在' });
    }
    
    res.json(strategy);
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
    
    // 验证游戏是否存在
    const game = await Game.findByPk(game_id);
    if (!game) {
      return res.status(404).json({ message: '指定的游戏不存在' });
    }
    
    const newStrategy = await Strategy.create({
      game_id,
      title,
      content,
      difficulty: difficulty || 'medium',
      type: type || 'general',
      author: req.user?.username || 'Anonymous',
      view_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.status(201).json(newStrategy);
  } catch (error) {
    console.error('创建攻略失败:', error);
    res.status(500).json({ message: '创建攻略失败' });
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
router.get('/tags', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']]
    });
    res.json(tags);
  } catch (error) {
    console.error('获取标签列表失败:', error);
    res.status(500).json({ message: '获取标签列表失败' });
  }
});

// 导出路由和添加示例数据函数
export { router as gamesRouter, addSampleData };