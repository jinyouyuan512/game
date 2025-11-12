-- Supabase数据库迁移脚本
-- 此脚本用于创建应用所需的所有表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE
);

-- 游戏表
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    coverImage VARCHAR(255),  -- 兼容mockData中的字段名
    status VARCHAR(50) DEFAULT 'active',
    platform VARCHAR(255),    -- 兼容mockData中的字段名
    developer VARCHAR(255),   -- 兼容mockData中的字段名
    publisher VARCHAR(255),   -- 兼容mockData中的字段名
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 攻略表
CREATE TABLE IF NOT EXISTS strategies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    game_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'published',
    view_count INTEGER DEFAULT 0,
    difficulty VARCHAR(50),   -- 兼容mockData中的字段名
    type VARCHAR(50),         -- 兼容mockData中的字段名
    image_urls TEXT,          -- 存储图片URL数组的JSON字符串
    video_urls TEXT,          -- 存储视频URL数组的JSON字符串
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(20) DEFAULT '#409EFF'
);

-- 攻略标签关联表
CREATE TABLE IF NOT EXISTS strategy_tags (
    strategy_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (strategy_id, tag_id),
    FOREIGN KEY (strategy_id) REFERENCES strategies(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- 笔记表
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 添加初始示例数据
-- 用户数据
INSERT INTO users (username, password, email)
VALUES 
    ('admin', '123456', 'admin@example.com'),
    ('user1', 'password1', 'user1@example.com')
ON CONFLICT (username) DO NOTHING;

-- 游戏数据
INSERT INTO games (id, name, description, coverImage, status, platform, developer, publisher)
VALUES 
    (1, '英雄联盟', '一款多人在线战术竞技游戏', 'lol.jpg', 'active', 'PC', 'Riot Games', 'Riot Games'),
    (2, '原神', '一款开放世界动作角色扮演游戏', 'genshin.jpg', 'active', 'PC/手机/主机', '米哈游', '米哈游'),
    (3, '王者荣耀', '一款多人在线战术竞技手机游戏', 'wzry.jpg', 'active', '手机', '腾讯', '腾讯')
ON CONFLICT (id) DO NOTHING;

-- 标签数据
INSERT INTO tags (id, name)
VALUES 
    (1, '新手'),
    (2, '攻略'),
    (3, '探索'),
    (4, '角色培养')
ON CONFLICT (id) DO NOTHING;

-- 攻略数据
INSERT INTO strategies (id, title, content, difficulty, type, game_id, user_id, view_count, status)
VALUES 
    (1, '英雄联盟新手攻略', '这是一份详细的新手入门指南...', '简单', '入门', 1, 1, 100, 'published'),
    (2, '原神探索技巧', '高效探索提瓦特大陆的方法...', '中等', '探索', 2, 2, 200, 'published')
ON CONFLICT (id) DO NOTHING;

-- 为策略标签添加关联数据
INSERT INTO strategy_tags (strategy_id, tag_id)
VALUES 
    (1, 1),
    (1, 2),
    (2, 3),
    (2, 4)
ON CONFLICT (strategy_id, tag_id) DO NOTHING;

-- 为表添加适当的索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_strategies_game_id ON strategies(game_id);
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_tags_strategy_id ON strategy_tags(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_tags_tag_id ON strategy_tags(tag_id);