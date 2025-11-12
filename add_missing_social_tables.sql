-- 创建缺失的社交功能相关表

-- 1. 游戏状态表（支持游戏状态分享功能）
CREATE TABLE IF NOT EXISTS game_statuses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    game_id INTEGER NOT NULL REFERENCES games(id),
    status_type VARCHAR(50) NOT NULL, -- playing, achievement, milestone
    status_content TEXT,
    current_level INTEGER,
    play_time INTEGER, -- 单位：分钟
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 组队邀请表
CREATE TABLE IF NOT EXISTS party_invitations (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id), -- NULL表示公开邀请
    game_id INTEGER NOT NULL REFERENCES games(id),
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

-- 3. 队伍成员表
CREATE TABLE IF NOT EXISTS party_members (
    id SERIAL PRIMARY KEY,
    party_id INTEGER NOT NULL REFERENCES party_invitations(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member', -- leader, member
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(party_id, user_id)
);

-- 4. 用户资料增强表（扩展现有UserProfile）
ALTER TABLE IF EXISTS user_profiles
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_media JSONB,
ADD COLUMN IF NOT EXISTS favorite_games INTEGER[],
ADD COLUMN IF NOT EXISTS play_style VARCHAR(100),
ADD COLUMN IF NOT EXISTS looking_for_partners BOOLEAN DEFAULT FALSE;

-- 5. 用户成就表
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    game_id INTEGER NOT NULL REFERENCES games(id),
    achievement_id VARCHAR(100),
    achievement_name VARCHAR(255) NOT NULL,
    achievement_description TEXT,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, game_id, achievement_id)
);

-- 6. 社区互动表（点赞、收藏等）
CREATE TABLE IF NOT EXISTS community_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    target_type VARCHAR(50) NOT NULL, -- post, comment, strategy
    target_id INTEGER NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- like, favorite, share
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_type, target_id, interaction_type)
);

-- 7. 用户黑名单表
CREATE TABLE IF NOT EXISTS user_blacklist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    blocked_user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, blocked_user_id)
);

-- 8. 消息撤回记录
ALTER TABLE IF EXISTS chat_messages
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_game_statuses_user_id ON game_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_game_statuses_game_id ON game_statuses(game_id);
CREATE INDEX IF NOT EXISTS idx_party_invitations_sender_id ON party_invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_party_invitations_receiver_id ON party_invitations(receiver_id);
CREATE INDEX IF NOT EXISTS idx_party_invitations_game_id ON party_invitations(game_id);
CREATE INDEX IF NOT EXISTS idx_party_invitations_invitation_code ON party_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_party_members_party_id ON party_members(party_id);
CREATE INDEX IF NOT EXISTS idx_party_members_user_id ON party_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_community_interactions_user_target ON community_interactions(user_id, target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_user_blacklist_user_id ON user_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_read ON chat_messages(receiver_id, is_read);