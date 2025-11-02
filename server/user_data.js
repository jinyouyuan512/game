// 用户收藏和浏览历史API
import express from 'express';
import { supabase } from './server.js';

const router = express.Router();

// 从auth.js导入认证中间件
import { authenticateToken } from './auth.js';

// 获取用户收藏列表
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 从数据库获取收藏列表，包含攻略详情
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*, strategies(id, title, content, game_id, user_id, status, view_count, created_at)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取收藏列表失败:', error);
      return res.status(500).json({ message: '获取收藏列表失败' });
    }
    
    // 格式化返回数据
    const favorites = data.map(fav => ({
      id: fav.id,
      strategy_id: fav.strategy_id,
      created_at: fav.created_at,
      strategy: {
        id: fav.strategies?.id,
        title: fav.strategies?.title,
        content: fav.strategies?.content,
        game_id: fav.strategies?.game_id,
        user_id: fav.strategies?.user_id,
        status: fav.strategies?.status,
        view_count: fav.strategies?.view_count,
        created_at: fav.strategies?.created_at
      }
    }));
    
    res.json(favorites);
    
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 添加收藏
router.post('/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { strategy_id } = req.body;
    
    if (!strategy_id) {
      return res.status(400).json({ message: '攻略ID不能为空' });
    }
    
    // 检查攻略是否存在
    const { data: strategy } = await supabase
      .from('strategies')
      .select('id')
      .eq('id', strategy_id)
      .single();
    
    if (!strategy) {
      return res.status(404).json({ message: '攻略不存在' });
    }
    
    // 检查是否已经收藏
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('strategy_id', strategy_id)
      .single();
    
    if (existing) {
      return res.status(400).json({ message: '已经收藏过该攻略' });
    }
    
    // 添加收藏
    const { data: newFavorite, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        strategy_id,
        created_at: new Date()
      })
      .select()
      .single();
    
    if (error) {
      console.error('添加收藏失败:', error);
      return res.status(500).json({ message: '添加收藏失败' });
    }
    
    res.status(201).json(newFavorite);
    
  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 删除收藏
router.delete('/favorites/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const favoriteId = req.params.id;
    
    // 检查收藏是否存在且属于当前用户
    const { data: favorite } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('id', favoriteId)
      .eq('user_id', userId)
      .single();
    
    if (!favorite) {
      return res.status(404).json({ message: '收藏不存在' });
    }
    
    // 删除收藏
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('id', favoriteId);
    
    if (error) {
      console.error('删除收藏失败:', error);
      return res.status(500).json({ message: '删除收藏失败' });
    }
    
    res.json({ message: '取消收藏成功' });
    
  } catch (error) {
    console.error('删除收藏错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 获取浏览历史
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 从数据库获取浏览历史，包含攻略详情
    const { data, error } = await supabase
      .from('user_history')
      .select('*, strategies(id, title, content, game_id, user_id, status, view_count, created_at)')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(100); // 限制返回最近100条记录
    
    if (error) {
      console.error('获取浏览历史失败:', error);
      return res.status(500).json({ message: '获取浏览历史失败' });
    }
    
    // 格式化返回数据
    const history = data.map(item => ({
      id: item.id,
      strategy_id: item.strategy_id,
      viewed_at: item.viewed_at,
      strategy: {
        id: item.strategies?.id,
        title: item.strategies?.title,
        content: item.strategies?.content,
        game_id: item.strategies?.game_id,
        user_id: item.strategies?.user_id,
        status: item.strategies?.status,
        view_count: item.strategies?.view_count,
        created_at: item.strategies?.created_at
      }
    }));
    
    res.json(history);
    
  } catch (error) {
    console.error('获取浏览历史错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 添加浏览记录
router.post('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { strategy_id } = req.body;
    
    if (!strategy_id) {
      return res.status(400).json({ message: '攻略ID不能为空' });
    }
    
    // 检查攻略是否存在
    const { data: strategy } = await supabase
      .from('strategies')
      .select('id')
      .eq('id', strategy_id)
      .single();
    
    if (!strategy) {
      return res.status(404).json({ message: '攻略不存在' });
    }
    
    // 检查是否已存在记录，如果存在则更新时间
    const { data: existing } = await supabase
      .from('user_history')
      .select('id')
      .eq('user_id', userId)
      .eq('strategy_id', strategy_id)
      .single();
    
    if (existing) {
      // 更新浏览时间
      const { data: updatedHistory, error } = await supabase
        .from('user_history')
        .update({
          viewed_at: new Date()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) {
        console.error('更新浏览记录失败:', error);
        return res.status(500).json({ message: '更新浏览记录失败' });
      }
      
      return res.json(updatedHistory);
    }
    
    // 创建新的浏览记录
    const { data: newHistory, error } = await supabase
      .from('user_history')
      .insert({
        user_id: userId,
        strategy_id,
        viewed_at: new Date()
      })
      .select()
      .single();
    
    if (error) {
      console.error('添加浏览记录失败:', error);
      return res.status(500).json({ message: '添加浏览记录失败' });
    }
    
    // 更新攻略的浏览次数
    await supabase
      .rpc('increment_view_count', { strategy_id });
    
    res.status(201).json(newHistory);
    
  } catch (error) {
    console.error('添加浏览记录错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 删除单个浏览记录
router.delete('/history/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const historyId = req.params.id;
    
    // 检查记录是否存在且属于当前用户
    const { data: history } = await supabase
      .from('user_history')
      .select('id')
      .eq('id', historyId)
      .eq('user_id', userId)
      .single();
    
    if (!history) {
      return res.status(404).json({ message: '浏览记录不存在' });
    }
    
    // 删除记录
    const { error } = await supabase
      .from('user_history')
      .delete()
      .eq('id', historyId);
    
    if (error) {
      console.error('删除浏览记录失败:', error);
      return res.status(500).json({ message: '删除浏览记录失败' });
    }
    
    res.json({ message: '删除浏览记录成功' });
    
  } catch (error) {
    console.error('删除浏览记录错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 清空浏览历史
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 清空用户的所有浏览记录
    const { error } = await supabase
      .from('user_history')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('清空浏览历史失败:', error);
      return res.status(500).json({ message: '清空浏览历史失败' });
    }
    
    res.json({ message: '浏览历史已清空' });
    
  } catch (error) {
    console.error('清空浏览历史错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

export default router;