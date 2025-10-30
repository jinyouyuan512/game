// strategies.js - 处理攻略相关的API路由
import express from 'express';
import { Strategy, Game } from './server.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const strategiesRouter = express.Router();

// 确保上传目录存在
const uploadDirs = {
  images: path.join(process.cwd(), '../uploads/images'),
  videos: path.join(process.cwd(), '../uploads/videos')
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 配置Multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, uploadDirs.images);
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, uploadDirs.videos);
    } else {
      cb(new Error('不支持的文件类型'), null);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000000);
    const ext = path.extname(file.originalname);
    cb(null, `${path.basename(file.originalname, ext)}-${timestamp}-${random}${ext}`);
  }
});

// 创建multer实例
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB限制
    files: 10 // 最多10个文件
  },
  fileFilter: (req, file, cb) => {
    // 检查文件类型
    if (file.mimetype.startsWith('image/')) {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('只支持JPG、PNG和GIF格式的图片'), false);
      }
    } else if (file.mimetype.startsWith('video/')) {
      const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/quicktime'];
      if (allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('只支持MP4、AVI和MOV格式的视频'), false);
      }
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

// 获取所有攻略
strategiesRouter.get('/api/strategies', async (req, res) => {
  try {
    console.log('收到GET /api/strategies请求');
    const strategies = await Strategy.findAll();
    // 不需要解析image_urls和video_urls字段，因为数据库中不存在这些字段
    const responseStrategies = strategies.map(strategy => ({
      ...strategy,
      image_urls: [], // 返回空数组作为默认值
      video_urls: [] // 返回空数组作为默认值
    }));
    
    res.json(responseStrategies);
  } catch (error) {
    console.error('获取攻略失败:', error);
    res.status(500).json({ error: '获取攻略失败', details: error.message });
  }
});

// 根据游戏ID获取攻略
strategiesRouter.get('/api/strategies/game/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    console.log(`收到GET /api/strategies/game/${gameId}请求`);
    
    // 验证gameId是否为有效数字
    const parsedGameId = parseInt(gameId);
    if (isNaN(parsedGameId)) {
      return res.status(400).json({ error: '无效的游戏ID' });
    }
    
    // 检查游戏是否存在
    const game = await Game.findByPk(parsedGameId);
    if (!game) {
      return res.status(404).json({ error: '游戏不存在' });
    }
    
    const strategies = await Strategy.findAll({ where: { game_id: parsedGameId, status: 'published' } });
    
    // 不需要解析image_urls和video_urls字段，因为数据库中不存在这些字段
    const responseStrategies = strategies.map(strategy => ({
      ...strategy,
      image_urls: [], // 返回空数组作为默认值
      video_urls: [] // 返回空数组作为默认值
    }));
    
    res.json(responseStrategies);
  } catch (error) {
    console.error(`获取游戏${req.params.gameId}的攻略失败:`, error);
    res.status(500).json({ error: '获取攻略失败', details: error.message });
  }
});

// 获取单个攻略详情
strategiesRouter.get('/api/strategies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`收到GET /api/strategies/${id}请求`);
    
    // 验证id是否为有效数字
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: '无效的攻略ID' });
    }
    
    const strategy = await Strategy.findByPk(parsedId);
    if (!strategy) {
      return res.status(404).json({ error: '攻略不存在' });
    }
    
    // 添加调试日志（不引用不存在的字段）
    console.log('数据库中的攻略数据:', {
      id: strategy.id,
      title: strategy.title,
      view_count: strategy.view_count,
      status: strategy.status
      // 移除对不存在的image_urls和video_urls字段的引用
    });
    
    // 增加浏览次数
    await Strategy.update(
      { view_count: (strategy.view_count || 0) + 1 },
      { where: { id: parsedId } }
    );
    
    // 不需要解析image_urls和video_urls字段，因为数据库中不存在这些字段
    const responseStrategy = {
      ...strategy,
      image_urls: [], // 返回空数组作为默认值
      video_urls: [] // 返回空数组作为默认值
    };
    
    // 添加响应数据日志
    console.log('返回的攻略数据:', {
      hasImageUrls: !!responseStrategy.image_urls,
      imageUrlsType: Array.isArray(responseStrategy.image_urls) ? 'array' : typeof responseStrategy.image_urls,
      imageUrlsLength: Array.isArray(responseStrategy.image_urls) ? responseStrategy.image_urls.length : 'not array',
      imageUrlsSample: Array.isArray(responseStrategy.image_urls) && responseStrategy.image_urls.length > 0 ? responseStrategy.image_urls[0] : 'none'
    });
    
    res.json(responseStrategy);
  } catch (error) {
    console.error(`获取攻略${req.params.id}详情失败:`, error);
    res.status(500).json({ error: '获取攻略详情失败', details: error.message });
  }
});

// 创建新攻略 - 支持文件上传
strategiesRouter.post('/api/strategies', (req, res) => {
  // 使用multer处理多文件上传
  upload.fields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 5 }])(req, res, async (err) => {
    try {
      if (err) {
        console.error('文件上传错误:', err);
        return res.status(400).json({ error: err.message });
      }

      console.log('收到POST /api/strategies请求');
      
      // 获取文本字段（根据请求类型获取）
      let bodyData = req.body;
      if (typeof bodyData === 'string') {
        bodyData = JSON.parse(bodyData);
      }
      
      console.log('请求体数据:', bodyData);
      
      // 提取请求数据
      const { title, content, difficulty, type, game_id, user_id } = bodyData;
      
      // 验证必填字段
      if (!title || !content || !difficulty || !type || !game_id || !user_id) {
        console.log('缺少必填字段');
        // 清理已上传的文件
        cleanupUploadedFiles(req.files);
        return res.status(400).json({ error: '缺少必填字段', required: ['title', 'content', 'difficulty', 'type', 'game_id', 'user_id'] });
      }
      
      // 验证game_id和user_id是否为有效数字
      const parsedGameId = parseInt(game_id);
      const parsedUserId = parseInt(user_id);
      
      if (isNaN(parsedGameId) || isNaN(parsedUserId)) {
        // 清理已上传的文件
        cleanupUploadedFiles(req.files);
        return res.status(400).json({ error: '无效的游戏ID或用户ID' });
      }
      
      // 检查游戏是否存在
      const game = await Game.findByPk(parsedGameId);
      if (!game) {
        // 清理已上传的文件
        cleanupUploadedFiles(req.files);
        return res.status(404).json({ error: '游戏不存在' });
      }
      
      // 处理上传的文件
      const imageUrls = [];
      const videoUrls = [];
      
      // 处理图片文件
      if (req.files && req.files.images) {
        req.files.images.forEach(file => {
          // 构建文件URL
          const filePath = `/uploads/images/${path.basename(file.path)}`;
          imageUrls.push(filePath);
        });
      }
      
      // 处理视频文件
      if (req.files && req.files.videos) {
        req.files.videos.forEach(file => {
          // 构建文件URL
          const filePath = `/uploads/videos/${path.basename(file.path)}`;
          videoUrls.push(filePath);
        });
      }
      
      // 构建新攻略数据，移除数据库中不存在的字段
      const strategyData = {
        title: title.trim(),
        content: content.trim(),
        difficulty: difficulty.trim(),
        type: type.trim(),
        game_id: parsedGameId,
        user_id: parsedUserId,
        view_count: 0,
        status: 'published' // 移除多余的逗号
        // 移除image_urls和video_urls字段，因为数据库中不存在这些字段
      };
      
      // 记录图片和视频路径
      console.log('攻略相关文件路径:');
      if (imageUrls.length > 0) console.log('图片URLs:', imageUrls);
      if (videoUrls.length > 0) console.log('视频URLs:', videoUrls);
      
      console.log('验证通过，准备创建攻略数据:', strategyData);
      
      // 创建新攻略
      const newStrategy = await Strategy.create(strategyData);
      console.log('攻略创建成功:', newStrategy.id);
      
      // 返回包含图片和视频URL的响应（直接使用上传的URLs，因为数据库中不存储这些字段）
      const responseData = {
        ...newStrategy,
        image_urls: imageUrls, // 直接返回上传的图片URLs
        video_urls: videoUrls // 直接返回上传的视频URLs
      };
      
      res.status(201).json(responseData);
    } catch (error) {
      console.error('创建攻略失败:', error);
      // 清理已上传的文件
      if (req.files) {
        cleanupUploadedFiles(req.files);
      }
      res.status(500).json({ error: '创建攻略失败', details: error.message });
    }
  });
});

// 清理上传的文件（用于出错时）
function cleanupUploadedFiles(files) {
  try {
    if (!files) return;
    
    // 清理图片文件
    if (files.images) {
      files.images.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    // 清理视频文件
    if (files.videos) {
      files.videos.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
  } catch (err) {
    console.error('清理上传文件失败:', err);
  }
}

// 更新攻略
strategiesRouter.put('/api/strategies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`收到PUT /api/strategies/${id}请求`);
    
    // 验证id是否为有效数字
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: '无效的攻略ID' });
    }
    
    // 检查攻略是否存在
    const existingStrategy = await Strategy.findByPk(parsedId);
    if (!existingStrategy) {
      return res.status(404).json({ error: '攻略不存在' });
    }
    
    // 更新攻略
    const [updatedCount, updatedStrategies] = await Strategy.update(updateData, { where: { id: parsedId } });
    
    if (updatedCount === 0) {
      return res.status(404).json({ error: '攻略更新失败' });
    }
    
    res.json(updatedStrategies[0]);
  } catch (error) {
    console.error(`更新攻略${req.params.id}失败:`, error);
    res.status(500).json({ error: '更新攻略失败', details: error.message });
  }
});

export { strategiesRouter };