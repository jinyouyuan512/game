import express from 'express';
import { authenticateToken } from './auth.js';
import { sequelize, Game, Strategy, Tag, StrategyTag } from './server.js';

const router = express.Router();

// 添加示例数据
async function addSampleData() {
  try {
    // 检查是否已有数据
    const existingGamesCount = await Game.count();
    if (existingGamesCount > 0) {
      console.log('数据库中已有游戏数据，跳过添加示例数据');
      return;
    }
    
    console.log('开始添加示例游戏数据...');
    
    // 创建示例游戏
    const games = await Promise.all([
      Game.create({
        name: '原神',
        description: '开放世界冒险游戏，拥有精美的画面和丰富的剧情。',
        developer: '米哈游',
        category: 'RPG',
        release_date: '2020-09-28',
        cover_image_url: 'https://example.com/genshin.jpg',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }),
      Game.create({
        name: '王者荣耀',
        description: '多人在线战术竞技游戏，5v5对战玩法。',
        developer: '腾讯游戏',
        category: 'MOBA',
        release_date: '2015-11-26',
        cover_image_url: 'https://example.com/honor-of-kings.jpg',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }),
      Game.create({
        name: '绝地求生',
        description: '大逃杀类型游戏，100名玩家在一个岛上生存竞技。',
        developer: 'PUBG Corporation',
        category: '射击',
        release_date: '2017-12-20',
        cover_image_url: 'https://example.com/pubg.jpg',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      })
    ]);
    
    console.log('示例游戏数据添加成功');
    console.log('开始添加示例攻略数据...');
    
    // 创建示例攻略
    await Promise.all([
      Strategy.create({
        game_id: games[0].id,
        title: '原神新手入门指南',
        content: '欢迎来到提瓦特大陆！作为新手，建议先完成主线任务，熟悉游戏机制...',
        difficulty: 'beginner',
        type: 'guide',
        author: '旅行者',
        status: 'published',
        view_count: 1532,
        created_at: new Date(),
        updated_at: new Date()
      }),
      Strategy.create({
        game_id: games[0].id,
        title: '原神角色培养攻略',
        content: '角色培养是提升战斗力的关键，本攻略详细介绍各角色的培养路线...',
        difficulty: 'intermediate',
        type: 'build',
        author: '元素大师',
        status: 'published',
        view_count: 2845,
        created_at: new Date(),
        updated_at: new Date()
      }),
      Strategy.create({
        game_id: games[1].id,
        title: '王者荣耀打野技巧大全',
        content: '打野是游戏中的重要位置，本攻略将教你如何高效清野和Gank...',
        difficulty: 'intermediate',
        type: 'strategy',
        author: '野区霸主',
        status: 'published',
        view_count: 3210,
        created_at: new Date(),
        updated_at: new Date()
      }),
      Strategy.create({
        game_id: games[2].id,
        title: '绝地求生枪法提升指南',
        content: '枪法是绝地求生中的核心技能，本攻略包含大量实战技巧和训练方法...',
        difficulty: 'advanced',
        type: 'guide',
        author: '枪王',
        status: 'published',
        view_count: 4567,
        created_at: new Date(),
        updated_at: new Date()
      })
    ]);
    
    console.log('示例攻略数据添加成功');
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
    
    // 格式化数据，添加game_name字段
    const formattedStrategies = strategies.map(strategy => {
      const plainStrategy = strategy.get({ plain: true });
      return {
        ...plainStrategy,
        game_name: plainStrategy.Game ? plainStrategy.Game.name : '未知游戏'
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