-- ==== media_resources表创建脚本 ====
-- 请将此SQL复制到Supabase仪表板的SQL编辑器中执行
-- 访问: https://app.supabase.com/project/YOUR_PROJECT_ID/sql

-- 创建媒体资源表，用于存储各种资源（游戏、攻略等）的图片和视频URL
-- 采用多态关联设计，使一个媒体资源表可以服务于多种类型的资源

-- 创建media_resources表
CREATE TABLE IF NOT EXISTS media_resources (
    id SERIAL PRIMARY KEY,
    resource_type VARCHAR(50) NOT NULL,  -- 资源类型，如'game'或'strategy'
    resource_id INTEGER NOT NULL,        -- 关联的资源ID
    image_urls TEXT DEFAULT '[]',        -- 存储图片URL数组的JSON字符串
    video_urls TEXT DEFAULT '[]',        -- 存储视频URL数组的JSON字符串
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- 添加唯一约束，确保每种资源类型和资源ID组合只有一条记录
    UNIQUE(resource_type, resource_id)
);

-- 为resource_type和resource_id添加索引，提高查询性能
CREATE INDEX IF NOT EXISTS idx_media_resources_type_id ON media_resources(resource_type, resource_id);

-- 为游戏添加初始媒体资源记录（从games表的coverImage字段迁移数据）
INSERT INTO media_resources (resource_type, resource_id, image_urls, video_urls)
SELECT 
    'game' as resource_type,
    id as resource_id,
    CASE 
        WHEN coverImage IS NOT NULL THEN CONCAT('["', coverImage, '"]')
        ELSE '[]'
    END as image_urls,
    '[]' as video_urls
FROM games
ON CONFLICT (resource_type, resource_id) DO NOTHING;

-- 为已有攻略添加媒体资源记录（从strategies表迁移数据）
INSERT INTO media_resources (resource_type, resource_id, image_urls, video_urls)
SELECT 
    'strategy' as resource_type,
    id as resource_id,
    COALESCE(image_urls, '[]') as image_urls,
    COALESCE(video_urls, '[]') as video_urls
FROM strategies
ON CONFLICT (resource_type, resource_id) DO NOTHING;

-- 验证表是否创建成功
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'media_resources'
ORDER BY ordinal_position;

-- 验证初始数据是否插入成功
SELECT resource_type, COUNT(*) as count 
FROM media_resources 
GROUP BY resource_type;

-- 显示一些示例数据
SELECT id, resource_type, resource_id, image_urls, video_urls 
FROM media_resources 
LIMIT 5;