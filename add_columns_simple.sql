-- 简单直接的SQLite脚本，用于添加缺失的列

-- 先检查当前表结构
PRAGMA table_info(strategies);

-- SQLite每次ALTER TABLE只能添加一个列，所以需要多次调用
-- 尝试添加image_urls列
ALTER TABLE strategies ADD COLUMN image_urls TEXT DEFAULT '[]';

-- 尝试添加video_urls列
ALTER TABLE strategies ADD COLUMN video_urls TEXT DEFAULT '[]';

-- 验证添加是否成功
PRAGMA table_info(strategies);