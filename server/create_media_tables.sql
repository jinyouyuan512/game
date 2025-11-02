-- 创建媒体文件存储表

-- 图片文件表
CREATE TABLE IF NOT EXISTS media_images (
    id SERIAL PRIMARY KEY,
    strategy_id INTEGER NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE
);

-- 视频文件表
CREATE TABLE IF NOT EXISTS media_videos (
    id SERIAL PRIMARY KEY,
    strategy_id INTEGER NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    duration INTEGER,  -- 视频时长（秒）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_media_images_strategy_id ON media_images(strategy_id);
CREATE INDEX IF NOT EXISTS idx_media_videos_strategy_id ON media_videos(strategy_id);

-- 注释：
-- 1. strategy_id 作为外键关联到 strategies 表
-- 2. ON DELETE CASCADE 确保当攻略被删除时，相关的媒体文件记录也会被自动删除
-- 3. 这样设计可以支持一个攻略有多个图片和视频