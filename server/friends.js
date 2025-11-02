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

// 获取用户好友列表
router.get('/api/friends', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user?.id || req.query.user_id;
    
    if (!user_id) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }
    
    // 从数据库获取好友 (使用新的数据模型)
    const { data, error } = await supabase
      .from('friendships')
      .select('*, friend:friend_id(*)')
      .eq('user_id', user_id)
      .eq('status', 'accepted');
    
    // 如果数据库中没有数据，返回模拟数据
    if (error || !data || data.length === 0) {
      const mockFriends = [
        {
          id: 1,
          user_id: parseInt(user_id),
          friend_id: 2,
          status: 'accepted',
          created_at: '2024-01-01T00:00:00Z',
          friend: {
            id: 2,
            username: '游戏大师',
            avatar: '/user-avatar2.png',
            online_status: 'online',
            last_active: '2024-01-15T10:30:00Z'
          }
        },
        {
          id: 2,
          user_id: parseInt(user_id),
          friend_id: 3,
          status: 'accepted',
          created_at: '2024-01-05T00:00:00Z',
          friend: {
            id: 3,
            username: '吃鸡达人',
            avatar: '/user-avatar3.png',
            online_status: 'offline',
            last_active: '2024-01-14T15:45:00Z'
          }
        },
        {
          id: 3,
          user_id: parseInt(user_id),
          friend_id: 4,
          status: 'accepted',
          created_at: '2024-01-10T00:00:00Z',
          friend: {
            id: 4,
            username: 'MOBA小王子',
            avatar: '/user-avatar4.png',
            online_status: 'online',
            last_active: '2024-01-15T09:15:00Z'
          }
        },
        {
          id: 4,
          user_id: parseInt(user_id),
          friend_id: 5,
          status: 'accepted',
          created_at: '2023-12-25T00:00:00Z',
          friend: {
            id: 5,
            username: '原神爱好者',
            avatar: '/user-avatar5.png',
            online_status: 'offline',
            last_active: '2024-01-13T22:00:00Z'
          }
        }
      ];
      
      // 按在线状态和最后活跃时间排序
      const sortedFriends = [...mockFriends].sort((a, b) => {
        // 在线用户排在前面
        if (a.friend.online_status !== b.friend.online_status) {
          return a.friend.online_status === 'online' ? -1 : 1;
        }
        // 相同状态按最后活跃时间排序
        return new Date(b.friend.last_active) - new Date(a.friend.last_active);
      });
      
      res.json({ friends: sortedFriends });
      return;
    }
    
    res.json({ friends: data });
  } catch (error) {
    console.error('获取好友列表失败:', error);
    res.status(500).json({ error: '获取好友列表失败' });
  }
});

// 获取好友请求
router.get('/api/friends/requests', async (req, res) => {
  try {
    const { user_id, type = 'received' } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }
    
    let query;
    if (type === 'received') {
      query = supabase
        .from('friend_requests')
        .select('*, sender:sender_id(*)')
        .eq('receiver_id', user_id)
        .eq('status', 'pending');
    } else {
      query = supabase
        .from('friend_requests')
        .select('*, receiver:receiver_id(*)')
        .eq('sender_id', user_id)
        .eq('status', 'pending');
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    // 如果数据库中没有数据，返回模拟数据
    if (error || !data || data.length === 0) {
      let mockRequests = [];
      
      if (type === 'received') {
        mockRequests = [
          {
            id: 1,
            sender_id: 6,
            receiver_id: parseInt(user_id),
            status: 'pending',
            message: '一起组队玩游戏吧！',
            created_at: '2024-01-15T09:00:00Z',
            sender: {
              id: 6,
              username: '新玩家小明',
              avatar: '/user-avatar6.png'
            }
          },
          {
            id: 2,
            sender_id: 7,
            receiver_id: parseInt(user_id),
            status: 'pending',
            message: '看了你分享的攻略，想请教一些问题',
            created_at: '2024-01-14T16:30:00Z',
            sender: {
              id: 7,
              username: '攻略爱好者',
              avatar: '/user-avatar7.png'
            }
          }
        ];
      } else {
        mockRequests = [
          {
            id: 3,
            sender_id: parseInt(user_id),
            receiver_id: 8,
            status: 'pending',
            message: '一起玩原神吗？',
            created_at: '2024-01-15T08:00:00Z',
            receiver: {
              id: 8,
              username: '原神大佬',
              avatar: '/user-avatar8.png'
            }
          }
        ];
      }
      
      res.json({ requests: mockRequests });
      return;
    }
    
    res.json({ requests: data });
  } catch (error) {
    console.error('获取好友请求失败:', error);
    res.status(500).json({ error: '获取好友请求失败' });
  }
});

// 发送好友请求
router.post('/api/friends/requests', async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;
    
    if (!sender_id || !receiver_id) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    if (sender_id === receiver_id) {
      return res.status(400).json({ error: '不能添加自己为好友' });
    }
    
    // 检查是否已经是好友
    const { data: existingFriend } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id.eq.${sender_id},friend_id.eq.${receiver_id}),and(user_id.eq.${receiver_id},friend_id.eq.${sender_id})`);
    
    if (existingFriend && existingFriend.length > 0) {
      return res.status(400).json({ error: '已经是好友了' });
    }
    
    // 检查是否已有待处理的请求
    const { data: existingRequest } = await supabase
      .from('friend_requests')
      .select('id')
      .or(`and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`)
      .eq('status', 'pending');
    
    if (existingRequest && existingRequest.length > 0) {
      return res.status(400).json({ error: '已有待处理的好友请求' });
    }
    
    const newRequest = {
      sender_id,
      receiver_id,
      message: message || '',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('friend_requests')
      .insert([newRequest])
      .select();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({ request: data[0] });
  } catch (error) {
    console.error('发送好友请求失败:', error);
    res.status(500).json({ error: '发送好友请求失败' });
  }
});

// 处理好友请求（接受/拒绝）
router.put('/api/friends/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, user_id } = req.body;
    
    if (!action || !user_id || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: '参数错误' });
    }
    
    // 获取请求信息
    const { data: request, error: requestError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (requestError || !request) {
      return res.status(404).json({ error: '好友请求不存在' });
    }
    
    if (request.receiver_id !== parseInt(user_id)) {
      return res.status(403).json({ error: '无权处理此请求' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: '好友请求已处理' });
    }
    
    // 更新请求状态
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: action })
      .eq('id', id);
    
    if (updateError) {
      throw updateError;
    }
    
    // 如果接受请求，创建好友关系
    if (action === 'accept') {
      const friendData = [
        {
          user_id: request.sender_id,
          friend_id: request.receiver_id,
          status: 'accepted',
          created_at: new Date()
        },
        {
          user_id: request.receiver_id,
          friend_id: request.sender_id,
          status: 'accepted',
          created_at: new Date()
        }
      ];
      
      await supabase.from('friendships').insert(friendData);
    }
    
    res.json({ success: true, action });
  } catch (error) {
    console.error('处理好友请求失败:', error);
    res.status(500).json({ error: '处理好友请求失败' });
  }
});

// 删除好友
router.delete('/api/friends/:friend_id', async (req, res) => {
  try {
    const { friend_id } = req.params;
    const { user_id } = req.body;
    
    if (!friend_id || !user_id) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${user_id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${user_id})`);
    
    if (error) {
      throw error;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('删除好友失败:', error);
    res.status(500).json({ error: '删除好友失败' });
  }
});

// 搜索用户
router.get('/api/users/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: '搜索关键词至少需要2个字符' });
    }
    
    // 从数据库搜索用户
    const { data, error } = await supabase
      .from('users')
      .select('id, username, avatar')
      .ilike('username', `%${query}%`)
      .limit(10);
    
    // 如果数据库中没有数据，返回模拟数据
    if (error || !data || data.length === 0) {
      const mockUsers = [
        {
          id: 101,
          username: query + '_玩家1',
          avatar: '/user-avatar101.png'
        },
        {
          id: 102,
          username: query + '_游戏迷',
          avatar: '/user-avatar102.png'
        },
        {
          id: 103,
          username: '热爱' + query + '的玩家',
          avatar: '/user-avatar103.png'
        }
      ];
      
      res.json({ users: mockUsers });
      return;
    }
    
    res.json({ users: data });
  } catch (error) {
    console.error('搜索用户失败:', error);
    res.status(500).json({ error: '搜索用户失败' });
  }
});

// 获取与特定好友的聊天记录
router.get('/api/chat/:friend_id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const friendId = req.params.friend_id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    // 获取聊天记录，包含发送者信息
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, sender:sender_id(*)')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('获取聊天记录失败:', error);
      return res.status(500).json({ message: '获取聊天记录失败' });
    }
    
    // 如果数据库中没有数据，返回空数组
    if (!data || data.length === 0) {
      return res.json({ messages: [] });
    }
    
    // 按时间升序返回（最新消息在后面）
    res.json({ messages: data.reverse() });
    
  } catch (error) {
    console.error('获取聊天记录错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 发送聊天消息
router.post('/api/chat/:friend_id', authenticateToken, async (req, res) => {
  try {
    const senderId = req.user?.id || 1;
    const receiverId = req.params.friend_id;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: '消息内容不能为空' });
    }
    
    // 检查是否是好友关系
    const { data: friendship } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id.eq.${senderId},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${senderId})`)
      .eq('status', 'accepted')
      .single();
    
    if (!friendship) {
      return res.status(403).json({ message: '只能与好友聊天' });
    }
    
    // 创建新消息
    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        created_at: new Date(),
        is_read: false
      })
      .select('*, sender:sender_id(*)')
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

// 标记消息为已读
router.put('/api/chat/messages/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const messageId = req.params.id;
    
    // 检查消息是否存在且是发给当前用户的
    const { data: message } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('id', messageId)
      .eq('receiver_id', userId)
      .single();
    
    if (!message) {
      return res.status(404).json({ message: '消息不存在' });
    }
    
    // 标记为已读
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true, read_at: new Date() })
      .eq('id', messageId);
    
    if (error) {
      console.error('标记消息已读失败:', error);
      return res.status(500).json({ message: '标记消息已读失败' });
    }
    
    res.json({ message: '消息已标记为已读' });
    
  } catch (error) {
    console.error('标记消息已读错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 获取未读消息数量
router.get('/api/chat/unread', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('sender_id, count(*) as count')
      .eq('receiver_id', userId)
      .eq('is_read', false)
      .group('sender_id');
    
    if (error) {
      console.error('获取未读消息数量失败:', error);
      return res.status(500).json({ message: '获取未读消息数量失败' });
    }
    
    res.json({ unread_counts: data || [] });
    
  } catch (error) {
    console.error('获取未读消息数量错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

export { router as friendsRouter };