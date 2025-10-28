import express from 'express';
import { authenticateToken } from './auth.js';
import { sequelize, Game, Strategy, Tag, StrategyTag } from './server.js';

const router = express.Router();

// 添加示例数据
async function addSampleData() {
  try {
    console.log('示例数据已存在，跳过添加');
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