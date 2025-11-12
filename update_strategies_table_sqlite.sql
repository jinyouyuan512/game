-- SQLite兼容的脚本，用于更新strategies表

-- 首先检查表是否存在这些列（使用PRAGMA）
PRAGMA table_info(strategies);

-- 尝试添加image_urls列（SQLite不支持IF NOT EXISTS）
BEGIN TRANSACTION;

-- 使用以下方法添加列（如果不存在）
-- 先创建临时表
CREATE TABLE IF NOT EXISTS strategies_temp AS SELECT * FROM strategies;

-- 删除原表
DROP TABLE IF EXISTS strategies;

-- 重新创建表，包含新列（使用正确的列名格式）
CREATE TABLE strategies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    game_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status VARCHAR(255) DEFAULT 'published',
    view_count INTEGER DEFAULT 0,
    createdAt DATETIME,
    updatedAt DATETIME,
    difficulty VARCHAR(255),
    type VARCHAR(255),
    image_urls TEXT DEFAULT '[]',
    video_urls TEXT DEFAULT '[]',
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 从临时表复制数据
INSERT INTO strategies (id, title, content, game_id, user_id, status, view_count, createdAt, updatedAt, difficulty, type, image_urls, video_urls)
SELECT 
    id, 
    title, 
    content, 
    game_id, 
    user_id, 
    status, 
    view_count, 
    createdAt, 
    updatedAt, 
    difficulty, 
    type, 
    '[]' as image_urls, 
    '[]' as video_urls
FROM strategies_temp;

-- 删除临时表
DROP TABLE IF EXISTS strategies_temp;

-- 提交事务
COMMIT;

-- 验证更新
PRAGMA table_info(strategies);