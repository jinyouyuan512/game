import express from 'express';
import { supabase } from './server.js';

const router = express.Router();

// 从auth.js导入认证中间件（如果存在）
let authenticateToken = (req, res, next) => next(); // 默认跳过认证

try {
  const authModule = require('./auth.js');
  if (authModule.authenticateToken) {
    authenticateToken = authModule.authenticateToken;
  }
} catch (e) {
  console.log('认证中间件未找到，使用默认认证');
}

// 获取社区帖子列表
router.get('/api/community/posts', async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    
    let query = supabase.from('community_posts').select('*, user:user_id(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    // 如果数据库中没有数据，返回模拟数据
    if (!data || data.length === 0) {
      const mockPosts = [
        {
          id: 1,
          title: '《原神》4.4版本更新内容讨论',
          content: '新版本带来了新角色、新地图和新活动，大家觉得这次更新怎么样？',
          category: 'discussion',
          user_id: 1,
          view_count: 1254,
          comment_count: 89,
          like_count: 345,
          created_at: '2024-01-15T10:00:00Z',
          user: {
            id: 1,
            username: '旅行者001',
            avatar: '/user-avatar1.png'
          }
        },
        {
          id: 2,
          title: '分享一个《赛博朋克2077》的隐藏彩蛋',
          content: '在夜之城的某个角落，我发现了一个致敬经典科幻电影的彩蛋，位置在...',
          category: 'guide',
          user_id: 2,
          view_count: 2134,
          comment_count: 156,
          like_count: 489,
          created_at: '2024-01-14T15:30:00Z',
          user: {
            id: 2,
            username: '夜之城传奇',
            avatar: '/user-avatar2.png'
          }
        },
        {
          id: 3,
          title: '《王者荣耀》新赛季上分心得分享',
          content: '本赛季打野节奏有很大变化，分享一下我的上分经验和常用英雄推荐...',
          category: 'strategy',
          user_id: 3,
          view_count: 3456,
          comment_count: 234,
          like_count: 678,
          created_at: '2024-01-13T09:15:00Z',
          user: {
            id: 3,
            username: '最强王者',
            avatar: '/user-avatar3.png'
          }
        },
        {
          id: 4,
          title: '《英雄联盟》S14版本强势英雄分析',
          content: '根据最近的比赛数据，这些英雄在当前版本表现非常出色...',
          category: 'analysis',
          user_id: 4,
          view_count: 2876,
          comment_count: 198,
          like_count: 567,
          created_at: '2024-01-12T14:20:00Z',
          user: {
            id: 4,
            username: '电竞分析师',
            avatar: '/user-avatar4.png'
          }
        },
        {
          id: 5,
          title: '组队开黑！寻找《绝地求生》队友',
          content: '技术一般，但心态好，寻找同样喜欢吃鸡的朋友一起组队...',
          category: 'team',
          user_id: 5,
          view_count: 1876,
          comment_count: 123,
          like_count: 234,
          created_at: '2024-01-11T11:45:00Z',
          user: {
            id: 5,
            username: '吃鸡小能手',
            avatar: '/user-avatar5.png'
          }
        }
      ];
      
      res.json({
        posts: mockPosts,
        total: mockPosts.length,
        page: 1,
        pages: 1
      });
      return;
    }
    
    res.json({
      posts: data,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('获取社区帖子失败:', error);
    res.status(500).json({ error: '获取社区帖子失败' });
  }
});

// 获取单个帖子详情
router.get('/api/community/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先尝试从数据库获取
    const { data: postData, error: postError } = await supabase
      .from('community_posts')
      .select('*, user:user_id(*)')
      .eq('id', id)
      .single();
    
    // 获取评论
    let comments = [];
    const { data: commentData, error: commentError } = await supabase
      .from('community_comments')
      .select('*, user:user_id(*)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    
    if (!commentError && commentData) {
      comments = commentData;
    }
    
    // 如果数据库中没有数据，返回模拟数据
    if (postError || !postData) {
      const mockPost = {
        id: parseInt(id),
        title: id === '1' ? '《原神》4.4版本更新内容讨论' : `热门游戏讨论 #${id}`,
        content: `这是一个详细的游戏讨论帖子，包含了丰富的内容和玩家经验分享。\n\n## 主要内容\n- 游戏机制解析\n- 玩法技巧分享\n- 装备搭配推荐\n- 团队协作心得\n\n欢迎大家在评论区留言讨论！`,
        category: 'discussion',
        user_id: 1,
        view_count: 1254,
        comment_count: 89,
        like_count: 345,
        created_at: '2024-01-15T10:00:00Z',
        user: {
          id: 1,
          username: '游戏达人',
          avatar: '/user-avatar1.png'
        }
      };
      
      const mockComments = [
        {
          id: 1,
          post_id: parseInt(id),
          user_id: 2,
          content: '非常有用的分享！学到了很多东西。',
          created_at: '2024-01-15T11:30:00Z',
          user: {
            id: 2,
            username: '新手玩家',
            avatar: '/user-avatar2.png'
          }
        },
        {
          id: 3,
          post_id: parseInt(id),
          user_id: 3,
          content: '我有不同的看法，我觉得...',
          created_at: '2024-01-15T12:45:00Z',
          user: {
            id: 3,
            username: '资深玩家',
            avatar: '/user-avatar3.png'
          }
        }
      ];
      
      res.json({
        post: mockPost,
        comments: mockComments
      });
      return;
    }
    
    res.json({
      post: postData,
      comments: comments
    });
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({ error: '获取帖子详情失败' });
  }
});

// 创建新帖子
router.post('/api/community/posts', async (req, res) => {
  try {
    const { title, content, category, user_id } = req.body;
    
    if (!title || !content || !category || !user_id) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    const newPost = {
      title,
      content,
      category,
      user_id,
      view_count: 0,
      comment_count: 0,
      like_count: 0,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('community_posts')
      .insert([newPost])
      .select();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({ post: data[0] });
  } catch (error) {
    console.error('创建帖子失败:', error);
    res.status(500).json({ error: '创建帖子失败' });
  }
});

// 添加评论
router.post('/api/community/comments', async (req, res) => {
  try {
    const { post_id, user_id, content } = req.body;
    
    if (!post_id || !user_id || !content) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    const newComment = {
      post_id,
      user_id,
      content,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('community_comments')
      .insert([newComment])
      .select();
    
    if (error) {
      throw error;
    }
    
    // 更新帖子评论数
    await supabase
      .from('community_posts')
      .update({ comment_count: supabase.raw('comment_count + 1') })
      .eq('id', post_id);
    
    res.status(201).json({ comment: data[0] });
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({ error: '添加评论失败' });
  }
});

// 获取社区频道列表
router.get('/api/community/channels', async (req, res) => {
  try {
    // 从数据库获取所有频道
    const { data, error } = await supabase
      .from('community_channels')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取频道列表失败:', error);
      return res.status(500).json({ message: '获取频道列表失败' });
    }
    
    // 如果数据库中没有数据，返回默认频道数据
    if (!data || data.length === 0) {
      const defaultChannels = [
        {
          id: 1,
          name: '综合讨论',
          description: '讨论各种游戏相关话题',
          created_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: '求助问答',
          description: '遇到游戏问题？在这里提问',
          created_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: '攻略分享',
          description: '分享你的游戏攻略和技巧',
          created_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      return res.json(defaultChannels);
    }
    
    res.json(data);
    
  } catch (error) {
    console.error('获取频道列表错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 创建新频道（需要认证）
router.post('/api/community/channels', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || 1; // 回退到默认用户
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: '频道名称不能为空' });
    }
    
    // 创建新频道
    const { data: newChannel, error } = await supabase
      .from('community_channels')
      .insert({
        name,
        description,
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();
    
    if (error) {
      console.error('创建频道失败:', error);
      return res.status(500).json({ message: '创建频道失败' });
    }
    
    res.status(201).json(newChannel);
    
  } catch (error) {
    console.error('创建频道错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 获取频道消息列表
router.get('/api/community/channels/:id/messages', async (req, res) => {
  try {
    const channelId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    // 获取频道消息，包含发送者信息
    const { data, error, count } = await supabase
      .from('community_messages')
      .select('*, user:user_id(*)', { count: 'exact' })
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('获取频道消息失败:', error);
      return res.status(500).json({ message: '获取频道消息失败' });
    }
    
    // 如果数据库中没有数据，返回模拟消息
    if (!data || data.length === 0) {
      const mockMessages = [
        {
          id: 1,
          channel_id: parseInt(channelId),
          user_id: 1,
          content: '欢迎来到这个频道！',
          created_at: new Date().toISOString(),
          user: {
            id: 1,
            username: '系统消息',
            avatar: '/user-avatar1.png'
          }
        }
      ];
      return res.json({
        messages: mockMessages,
        total: mockMessages.length,
        limit,
        offset
      });
    }
    
    res.json({
      messages: data,
      total: count || data.length,
      limit,
      offset
    });
    
  } catch (error) {
    console.error('获取频道消息错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 发送频道消息（需要认证）
router.post('/api/community/channels/:id/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || 1; // 回退到默认用户
    const channelId = req.params.id;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: '消息内容不能为空' });
    }
    
    // 创建新消息
    const { data: newMessage, error } = await supabase
      .from('community_messages')
      .insert({
        channel_id: channelId,
        user_id: userId,
        content,
        created_at: new Date()
      })
      .select('*, user:user_id(*)')
      .single();
    
    if (error) {
      console.error('发送消息失败:', error);
      return res.status(500).json({ message: '发送消息失败' });
    }
    
    res.status(201).json(newMessage);
    
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

export { router as communityRouter };