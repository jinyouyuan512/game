-- 完整的社交功能数据库结构

-- 1. 扩展用户表
ALTER TABLE IF NOT EXISTS users
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS online_status VARCHAR(20) DEFAULT 'offline',
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_game_id INTEGER REFERENCES games(id);

-- 2. 社交互动核心表 - 完善现有表
-- 好友关系表
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, blocked
  nickname VARCHAR(100), -- 好友备注
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- 好友请求表
CREATE TABLE IF NOT EXISTS friend_requests (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- 用户黑名单表
CREATE TABLE IF NOT EXISTS user_blacklist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, blocked_user_id),
  CHECK (user_id != blocked_user_id)
);

-- 3. 游戏状态表
CREATE TABLE IF NOT EXISTS game_statuses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  status_type VARCHAR(50) NOT NULL, -- playing, achievement, milestone, custom
  status_content TEXT,
  current_level INTEGER,
  play_time INTEGER, -- 单位：分钟
  progress_percentage DECIMAL(5,2),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 用户成就表
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100),
  achievement_name VARCHAR(255) NOT NULL,
  achievement_description TEXT,
  achievement_icon VARCHAR(255),
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_public BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, game_id, achievement_id)
);

-- 5. 组队系统表
CREATE TABLE IF NOT EXISTS party_invitations (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- NULL表示公开邀请
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  invitation_type VARCHAR(50) NOT NULL, -- direct, open, link_based
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined, expired
  message TEXT,
  max_members INTEGER DEFAULT 5,
  current_members INTEGER DEFAULT 1,
  expires_at TIMESTAMP,
  invitation_code VARCHAR(20) UNIQUE, -- 用于链接邀请
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS party_members (
  id SERIAL PRIMARY KEY,
  party_id INTEGER NOT NULL REFERENCES party_invitations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- leader, member
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(party_id, user_id)
);

-- 6. 聊天系统表
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  is_group_chat BOOLEAN DEFAULT FALSE,
  name VARCHAR(255), -- 群聊名称
  avatar VARCHAR(255), -- 群聊头像
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversation_members (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_message_id INTEGER,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- text, image, emoji, system
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS message_read_status (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(message_id, user_id)
);

-- 7. 社区内容表
CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- post, guide, video, image
  game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
  media_urls TEXT[], -- 存储图片、视频等URL数组
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'published'
);

CREATE TABLE IF NOT EXISTS community_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES community_comments(id) ON DELETE CASCADE, -- 回复评论
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_interactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL, -- post, comment, strategy
  target_id INTEGER NOT NULL,
  interaction_type VARCHAR(50) NOT NULL, -- like, favorite, share
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, target_type, target_id, interaction_type)
);

-- 8. 用户资料增强表
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nickname VARCHAR(255),
  avatar VARCHAR(255),
  bio TEXT,
  location VARCHAR(100),
  birth_date DATE,
  website VARCHAR(255),
  social_media JSONB, -- 存储社交媒体链接
  favorite_games INTEGER[],
  play_style VARCHAR(100),
  looking_for_partners BOOLEAN DEFAULT FALSE,
  game_status_visibility VARCHAR(50) DEFAULT 'friends', -- public, friends, private
  achievements_visibility VARCHAR(50) DEFAULT 'friends', -- public, friends, private
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- 9. 用户游戏统计
CREATE TABLE IF NOT EXISTS user_game_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  games_played INTEGER DEFAULT 0,
  achievements_unlocked INTEGER DEFAULT 0,
  total_play_time INTEGER DEFAULT 0, -- 单位：分钟
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS user_game_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  play_time INTEGER DEFAULT 0, -- 此次游玩时长（分钟）
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. 热门内容推荐相关表
CREATE TABLE IF NOT EXISTS content_analytics (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL, -- post, strategy, game
  content_id INTEGER NOT NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  content_type VARCHAR(50),
  content_id INTEGER,
  metadata JSONB, -- 存储活动相关的额外数据
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_blacklist_user_id ON user_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_game_statuses_user_id ON game_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_game_statuses_game_id ON game_statuses(game_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_party_invitations_sender_id ON party_invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_party_invitations_receiver_id ON party_invitations(receiver_id);
CREATE INDEX IF NOT EXISTS idx_party_invitations_game_id ON party_invitations(game_id);
CREATE INDEX IF NOT EXISTS idx_party_invitations_invitation_code ON party_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_party_members_party_id ON party_members(party_id);
CREATE INDEX IF NOT EXISTS idx_party_members_user_id ON party_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_game_id ON community_posts(game_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent_id ON community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_interactions_user_target ON community_interactions(user_id, target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_stats_user_id ON user_game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_history_user_id ON user_game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_engagement ON content_analytics(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);