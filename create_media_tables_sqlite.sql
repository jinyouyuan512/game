-- SQLite兼容的媒体文件存储表

-- 图片文件表
CREATE TABLE IF NOT EXISTS media_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_id INTEGER NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE
);

-- 视频文件表
CREATE TABLE IF NOT EXISTS media_videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_id INTEGER NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    duration INTEGER,  -- 视频时长（秒）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_media_images_strategy_id ON media_images(strategy_id);
CREATE INDEX IF NOT EXISTS idx_media_videos_strategy_id ON media_videos(strategy_id);

-- 验证表是否创建成功
.tables