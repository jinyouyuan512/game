// strategies.js - 处理攻略相关的API路由
import express from 'express';
import { Strategy, Game, supabase } from './server.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

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
    try {
      if (file.mimetype.startsWith('image/')) {
        cb(null, uploadDirs.images);
      } else if (file.mimetype.startsWith('video/')) {
        cb(null, uploadDirs.videos);
      } else {
        cb(new Error('不支持的文件类型，请上传图片或视频'), null);
      }
    } catch (error) {
      console.error('文件存储目标错误:', error);
      cb(new Error('无法确定文件存储位置'), null);
    }
  },
  filename: (req, file, cb) => {
    try {
      // 使用UUID生成唯一的文件名，避免冲突
      const uuid = uuidv4();
      const ext = path.extname(file.originalname);
      // 获取不含扩展名的原始文件名
      const originalName = path.basename(file.originalname, ext);
      // 使用Buffer来正确处理中文文件名编码
      const safeOriginalName = Buffer.from(originalName, 'utf8').toString('utf8');
      const safeFilename = `${safeOriginalName}-${uuid}${ext}`;
      console.log('原始文件名:', file.originalname);
      console.log('处理后文件名:', safeFilename);
      cb(null, safeFilename);
    } catch (error) {
      console.error('文件名生成错误:', error);
      cb(new Error('无法生成文件名'), null);
    }
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
    try {
      // 获取文件扩展名
      const ext = path.extname(file.originalname).toLowerCase();
      
      // 检查文件类型
      if (file.mimetype.startsWith('image/')) {
        // 更宽松的图片类型检测，同时检查MIME类型和文件扩展名
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        const allowedImageExts = ['.jpg', '.jpeg', '.png', '.gif'];
        
        if (allowedImageTypes.includes(file.mimetype) || allowedImageExts.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('只支持JPG、PNG和GIF格式的图片'), false);
        }
      } else if (file.mimetype.startsWith('video/')) {
        const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/mov'];
        if (allowedVideoTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('只支持MP4、AVI和MOV格式的视频'), false);
        }
      } else {
        // 对于无法通过MIME类型判断的文件，通过扩展名做最终检查
        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mov'];
        if (allowedExts.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('不支持的文件类型，请上传图片或视频'), false);
        }
      }
    } catch (error) {
      console.error('文件类型过滤错误:', error);
      cb(new Error('文件类型检查失败'), false);
    }
  }
});

// 安全解析JSON字符串的辅助函数
const safeJSONParse = (jsonString, defaultValue = []) => {
  if (!jsonString || typeof jsonString !== 'string') {
    return defaultValue;
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('解析JSON失败:', error);
    return defaultValue;
  }
};

// 获取所有攻略
strategiesRouter.get('/api/strategies', async (req, res) => {
  try {
    console.log('收到GET /api/strategies请求');
    const strategies = await Strategy.findAll({
      include: [{ model: Game }]
    });
    
    // 解析image_urls和video_urls字段
    const responseStrategies = strategies.map(strategy => {
      return {
        ...strategy,
        image_urls: safeJSONParse(strategy.image_urls),
        video_urls: safeJSONParse(strategy.video_urls)
      };
    });
    
    // 返回统一格式的响应
    res.json({
      success: true,
      data: responseStrategies,
      message: `成功获取 ${responseStrategies.length} 条攻略`
    });
  } catch (error) {
    console.error('获取攻略失败:', error);
    res.status(500).json({
      success: false,
      error: '获取攻略失败',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 根据游戏ID获取攻略
strategiesRouter.get('/api/strategies/game/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    console.log(`收到GET /api/strategies/game/${gameId}请求`);
    
    // 验证gameId是否为有效数字
    const parsedGameId = parseInt(gameId);
    if (isNaN(parsedGameId) || parsedGameId <= 0) {
      return res.status(400).json({
        success: false,
        error: '无效的游戏ID'
      });
    }
    
    // 检查游戏是否存在
    const game = await Game.findByPk(parsedGameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: '游戏不存在'
      });
    }
    
    const strategies = await Strategy.findAll({ 
      where: { game_id: parsedGameId, status: 'published' },
      include: [{ model: Game }],
      order: [['created_at', 'DESC']]
    });
    
    // 解析image_urls和video_urls字段
    const responseStrategies = strategies.map(strategy => {
      return {
        ...strategy,
        image_urls: safeJSONParse(strategy.image_urls),
        video_urls: safeJSONParse(strategy.video_urls)
      };
    });
    
    // 返回统一格式的响应
    res.json({
      success: true,
      data: responseStrategies,
      message: `成功获取 ${responseStrategies.length} 条攻略`,
      gameId: parsedGameId
    });
  } catch (error) {
    console.error(`获取游戏${req.params.gameId}的攻略失败:`, error);
    res.status(500).json({
      success: false,
      error: '获取攻略失败',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 获取单个攻略详情
strategiesRouter.get('/api/strategies/:id', async (req, res) => {
  console.log('===== API请求开始 =====');
  try {
    const { id } = req.params;
    console.log(`收到GET /api/strategies/${id}请求`);
    
    // 验证id是否为有效数字
    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        success: false,
        error: '无效的攻略ID'
      });
    }
    
    const strategy = await Strategy.findByPk(parsedId, {
      include: [{ model: Game }]
    });
    
    if (!strategy) {
      return res.status(404).json({
        success: false,
        error: '攻略不存在'
      });
    }
    
    // 增加浏览次数
    await Strategy.update(
      { view_count: (strategy.view_count || 0) + 1 },
      { where: { id: parsedId } }
    );
    
    // 从media_images和media_videos表中获取媒体文件信息
      const { data: imagesData } = await supabase
        .from('media_images')
        .select('file_path')
        .eq('strategy_id', parsedId);
      
      const { data: videosData } = await supabase
        .from('media_videos')
        .select('file_path')
        .eq('strategy_id', parsedId);
      
      // 提取图片和视频URLs，并处理Unicode转义字符
      const processFilePath = (filePath) => {
        if (!filePath) return filePath;
        
        try {
          // 首先尝试处理\xXX格式的转义字符
          let processedPath = filePath.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
          });
          
          // 如果路径中仍有乱码字符，尝试使用Buffer重新解码
          if (processedPath.includes('è') || processedPath.includes('å') || processedPath.includes('ä')) {
            console.log('检测到可能的乱码，尝试重新解码:', processedPath);
            // 将乱码字符串转换为Buffer，然后重新解码为UTF-8
            const buffer = Buffer.from(processedPath, 'latin1');
            processedPath = buffer.toString('utf8');
            console.log('重新解码后的路径:', processedPath);
          }
          
          return processedPath;
        } catch (e) {
          console.warn('处理文件路径Unicode转义字符失败:', e.message);
          return filePath;
        }
      };
      
      const imageUrls = imagesData?.map(img => processFilePath(img.file_path)) || [];
      const videoUrls = videosData?.map(video => processFilePath(video.file_path)) || [];
      
      console.log('!!! 处理后的图片URLs:', JSON.stringify(imageUrls));
      console.log('!!! 处理后的视频URLs:', JSON.stringify(videoUrls));
      
      // 计算媒体统计信息
      const mediaStats = {
        images: imageUrls.length,
        videos: videoUrls.length
      };
    
    const responseStrategy = {
      ...strategy,
      image_urls: imageUrls,
      video_urls: videoUrls,
      media_stats: mediaStats
    };
    
    // 添加调试日志，查看返回给前端的数据
    console.log('===== 返回给前端的完整攻略数据 =====');
    console.log('image_urls:', imageUrls);
    console.log('video_urls:', videoUrls);
    console.log('===== 数据结束 =====');
    
    // 返回统一格式的响应
    const finalResponse = {
      success: true,
      data: responseStrategy,
      message: '成功获取攻略详情',
      mediaStats: mediaStats
    };
    
    console.log('最终响应给前端的数据结构:', JSON.stringify(finalResponse, null, 2));
    res.json(finalResponse);
  } catch (error) {
    console.error(`获取攻略${req.params.id}详情失败:`, error);
    res.status(500).json({
      success: false,
      error: '获取攻略详情失败',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 创建新攻略 - 支持文件上传
strategiesRouter.post('/api/strategies', (req, res) => {
  // 使用multer处理多文件上传
  upload.fields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 1 }])(req, res, async (err) => {
    try {
      if (err) {
        console.error('文件上传错误:', err);
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      console.log('收到POST /api/strategies请求');
      
      // 已上传文件的路径列表，用于错误时清理
      const uploadedFilePaths = [];
      
      // 获取文本字段（处理FormData和JSON两种情况）
      let bodyData = req.body;
      if (typeof bodyData === 'string') {
        try {
          bodyData = JSON.parse(bodyData);
        } catch (parseError) {
          console.error('解析请求体失败:', parseError);
          return res.status(400).json({
            success: false,
            error: '请求数据格式错误'
          });
        }
      }
      
      console.log('请求体数据:', bodyData);
      
      // 提取请求数据
      const { title, content, difficulty, type, game_id, user_id } = bodyData;
      
      // 验证必填字段
      if (!title || !content || !difficulty || !type || !game_id || !user_id) {
        console.log('缺少必填字段');
        // 清理已上传的文件
        cleanupUploadedFiles(req.files);
        return res.status(400).json({
          success: false,
          error: '缺少必填字段',
          required: ['title', 'content', 'difficulty', 'type', 'game_id', 'user_id']
        });
      }
      
      // 验证标题和内容长度
      if (title.length > 100) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({
          success: false,
          error: '标题长度不能超过100个字符'
        });
      }
      
      if (content.length < 50) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({
          success: false,
          error: '攻略内容至少需要50个字符'
        });
      }
      
      // 验证game_id和user_id是否为有效数字
      const parsedGameId = parseInt(game_id);
      const parsedUserId = parseInt(user_id);
      
      if (isNaN(parsedGameId) || parsedGameId <= 0 || isNaN(parsedUserId) || parsedUserId <= 0) {
        // 清理已上传的文件
        cleanupUploadedFiles(req.files);
        return res.status(400).json({
          success: false,
          error: '无效的游戏ID或用户ID'
        });
      }
      
      // 检查游戏是否存在
      const game = await Game.findByPk(parsedGameId);
      if (!game) {
        // 清理已上传的文件
        cleanupUploadedFiles(req.files);
        return res.status(404).json({
          success: false,
          error: '游戏不存在'
        });
      }
      
      // 处理上传的文件
      const imageUrls = [];
      const videoUrls = [];
      
      // 处理图片文件
      if (req.files && req.files.images && Array.isArray(req.files.images)) {
        req.files.images.forEach(file => {
          // 保存物理路径用于清理
          uploadedFilePaths.push(file.path);
          // 构建文件URL
          const filePath = `/uploads/images/${path.basename(file.path)}`;
          imageUrls.push(filePath);
        });
      }
      
      // 处理视频文件
      if (req.files && req.files.videos && Array.isArray(req.files.videos)) {
        req.files.videos.forEach(file => {
          // 保存物理路径用于清理
          uploadedFilePaths.push(file.path);
          // 构建文件URL
          const filePath = `/uploads/videos/${path.basename(file.path)}`;
          videoUrls.push(filePath);
        });
      }
      
      console.log(`准备创建攻略: ${title}, 图片: ${imageUrls.length}, 视频: ${videoUrls.length}`);
      
      // 构建攻略数据，注意：数据库中没有image_urls和video_urls列，暂不保存这些字段
      let strategyData = {
        title: title.trim(),
        content: content.trim(),
        difficulty: difficulty.trim(),
        type: type.trim(),
        game_id: parsedGameId,
        user_id: parsedUserId,
        view_count: 0,
        status: 'published'
        // 注意：image_urls和video_urls字段在数据库中不存在，暂时不保存
      };
      console.log('注意：由于数据库表结构限制，暂不保存image_urls和video_urls字段');
      
      console.log('准备保存到数据库的攻略数据:', JSON.stringify(strategyData, null, 2));
      
      // 将攻略数据保存到数据库
      const createdStrategy = await Strategy.create(strategyData);
      console.log('攻略已成功保存到数据库:', createdStrategy.id);
      
      // 保存图片信息到媒体表
      if (imageUrls.length > 0) {
        console.log('准备保存图片信息到media_images表');
        const imageRecords = imageUrls.map((imageUrl, index) => {
          const fileName = path.basename(imageUrl);
          // 从req.files中获取文件信息
          const file = req.files?.images?.[index];
          return {
            strategy_id: createdStrategy.id,
            file_path: imageUrl,
            file_name: fileName,
            file_size: file?.size,
            mime_type: file?.mimetype
          };
        });
        
        try {
          // 使用Supabase插入图片记录
          await supabase
            .from('media_images')
            .insert(imageRecords);
          console.log('图片信息已保存到media_images表');
        } catch (supabaseError) {
          console.error('保存图片信息到Supabase失败:', supabaseError);
          // 这里我们不抛出错误，只记录日志，因为图片信息保存失败不应该影响攻略的创建
        }
      }
      
      // 保存视频信息到媒体表
      if (videoUrls.length > 0) {
        console.log('准备保存视频信息到media_videos表');
        const videoRecords = videoUrls.map((videoUrl, index) => {
          const fileName = path.basename(videoUrl);
          // 从req.files中获取文件信息
          const file = req.files?.videos?.[index];
          return {
            strategy_id: createdStrategy.id,
            file_path: videoUrl,
            file_name: fileName,
            file_size: file?.size,
            mime_type: file?.mimetype
          };
        });
        
        try {
          // 使用Supabase插入视频记录
          await supabase
            .from('media_videos')
            .insert(videoRecords);
          console.log('视频信息已保存到media_videos表');
        } catch (supabaseError) {
          console.error('保存视频信息到Supabase失败:', supabaseError);
          // 这里我们不抛出错误，只记录日志，因为视频信息保存失败不应该影响攻略的创建
        }
      }
      
      // 构建响应数据
      const responseData = {
        id: createdStrategy.id,
        title: createdStrategy.title,
        content: createdStrategy.content,
        difficulty: createdStrategy.difficulty,
        type: createdStrategy.type,
        game_id: createdStrategy.game_id,
        user_id: createdStrategy.user_id,
        view_count: createdStrategy.view_count,
        status: createdStrategy.status,
        image_urls: imageUrls,
        video_urls: videoUrls,
        game: { id: game.id, name: game.name }
      };
      
      return res.status(201).json({
        success: true,
        message: '攻略创建成功，媒体文件已上传并保存',
        data: responseData,
        mediaStats: {
          images: imageUrls.length,
          videos: videoUrls.length
        }
      });
    } catch (error) {
      console.error('创建攻略失败:', error);
      // 清理已上传的文件
      if (req.files) {
        cleanupUploadedFiles(req.files);
      }
      
      // 返回统一格式的错误响应
      res.status(500).json({
        success: false,
        error: '创建攻略失败',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
});

// 清理上传的文件（用于出错时）
function cleanupUploadedFiles(files) {
  try {
    if (!files) return;
    
    console.log('开始清理上传的文件...');
    
    // 清理图片文件
    if (files.images && Array.isArray(files.images)) {
      files.images.forEach(file => {
        if (file && file.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
            console.log(`已删除文件: ${file.path}`);
          } catch (unlinkError) {
            console.error(`删除文件失败: ${file.path}`, unlinkError);
          }
        }
      });
    }
    
    // 清理视频文件
    if (files.videos && Array.isArray(files.videos)) {
      files.videos.forEach(file => {
        if (file && file.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
            console.log(`已删除文件: ${file.path}`);
          } catch (unlinkError) {
            console.error(`删除文件失败: ${file.path}`, unlinkError);
          }
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

// 删除攻略
strategiesRouter.delete('/api/strategies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`收到DELETE /api/strategies/${id}请求`);
    
    // 验证id是否为有效数字
    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        success: false,
        error: '无效的攻略ID'
      });
    }
    
    // 检查攻略是否存在
    const strategy = await Strategy.findByPk(parsedId);
    if (!strategy) {
      return res.status(404).json({
        success: false,
        error: '攻略不存在'
      });
    }
    
    console.log(`准备删除攻略: ${strategy.title}`);
    
    // 1. 获取并删除关联的媒体文件记录和物理文件
    // 获取图片记录
    const { data: imagesData } = await supabase
      .from('media_images')
      .select('file_path')
      .eq('strategy_id', parsedId);
    
    // 获取视频记录
    const { data: videosData } = await supabase
      .from('media_videos')
      .select('file_path')
      .eq('strategy_id', parsedId);
    
    // 物理删除图片文件
    if (imagesData && imagesData.length > 0) {
      console.log(`找到 ${imagesData.length} 个关联的图片文件，准备删除`);
      imagesData.forEach(image => {
        const filePath = path.join(process.cwd(), '..', image.file_path);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`已删除图片文件: ${filePath}`);
          } catch (unlinkError) {
            console.error(`删除图片文件失败: ${filePath}`, unlinkError);
          }
        }
      });
      
      // 删除数据库中的图片记录
      await supabase
        .from('media_images')
        .delete()
        .eq('strategy_id', parsedId);
      console.log('已删除数据库中的图片记录');
    }
    
    // 物理删除视频文件
    if (videosData && videosData.length > 0) {
      console.log(`找到 ${videosData.length} 个关联的视频文件，准备删除`);
      videosData.forEach(video => {
        const filePath = path.join(process.cwd(), '..', video.file_path);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`已删除视频文件: ${filePath}`);
          } catch (unlinkError) {
            console.error(`删除视频文件失败: ${filePath}`, unlinkError);
          }
        }
      });
      
      // 删除数据库中的视频记录
      await supabase
        .from('media_videos')
        .delete()
        .eq('strategy_id', parsedId);
      console.log('已删除数据库中的视频记录');
    }
    
    // 2. 删除关联的标签记录
    await supabase
      .from('strategy_tags')
      .delete()
      .eq('strategy_id', parsedId);
    console.log('已删除关联的标签记录');
    
    // 3. 删除攻略记录
    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', parsedId);
    
    if (error) {
      console.error('删除攻略记录失败:', error);
      throw error;
    }
    
    console.log(`攻略 "${strategy.title}" 及其关联数据已成功删除`);
    
    // 返回成功响应
    return res.json({
      success: true,
      message: '攻略及其关联数据已成功删除',
      data: {
        id: parsedId,
        title: strategy.title,
        mediaDeleted: {
          images: imagesData ? imagesData.length : 0,
          videos: videosData ? videosData.length : 0
        }
      }
    });
    
  } catch (error) {
    console.error(`删除攻略${req.params.id}失败:`, error);
    res.status(500).json({
      success: false,
      error: '删除攻略失败',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export { strategiesRouter };