-- 更新strategies表，添加缺失的image_urls和video_urls列
ALTER TABLE strategies
ADD COLUMN IF NOT EXISTS image_urls TEXT,
ADD COLUMN IF NOT EXISTS video_urls TEXT;

-- 为现有数据设置默认值
UPDATE strategies
SET image_urls = '[]'
WHERE image_urls IS NULL;

UPDATE strategies
SET video_urls = '[]'
WHERE video_urls IS NULL;

-- 可选：为表添加索引以提高性能
CREATE INDEX IF NOT EXISTS idx_strategies_image_urls ON strategies(image_urls);
CREATE INDEX IF NOT EXISTS idx_strategies_video_urls ON strategies(video_urls);

-- 验证更新是否成功
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'strategies'
ORDER BY ordinal_position;