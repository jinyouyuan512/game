# Supabase 媒体表创建指南

## 问题概述

在尝试通过API自动创建Supabase数据库表时，我们遇到了以下问题：

1. 通过Node.js客户端执行SQL时遇到Schema缓存问题
2. 无法直接通过REST API执行SQL语句（安全限制）
3. 自动创建表操作未能成功反映在数据库中

## 解决方案

经过多次尝试，我们建议**手动在Supabase控制台中创建表**。这是最直接可靠的方法。

## 手动创建步骤

1. 打开浏览器，访问：`https://ubgakjfcjnnnksnlxxgj.supabase.co`
2. 登录到您的Supabase账户
3. 进入您的项目
4. 点击左侧菜单中的"SQL Editor"
5. 复制以下SQL语句并粘贴到SQL编辑器中
6. 点击"RUN"按钮执行SQL
7. 执行完成后，点击"Reload Schema"按钮刷新缓存

## SQL语句

```sql
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

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_media_images_strategy_id ON media_images(strategy_id);
CREATE INDEX IF NOT EXISTS idx_media_videos_strategy_id ON media_videos(strategy_id);
```

## 表结构说明

### media_images表
- `id`: 主键，自增整数
- `strategy_id`: 外键，关联到strategies表的id
- `file_path`: 文件存储路径
- `file_name`: 文件名
- `file_size`: 文件大小（字节）
- `mime_type`: 文件MIME类型
- `created_at`: 创建时间
- 外键约束：当关联的攻略被删除时，相关的图片记录也会被级联删除

### media_videos表
- `id`: 主键，自增整数
- `strategy_id`: 外键，关联到strategies表的id
- `file_path`: 文件存储路径
- `file_name`: 文件名
- `file_size`: 文件大小（字节）
- `mime_type`: 文件MIME类型
- `duration`: 视频时长（秒）
- `created_at`: 创建时间
- 外键约束：当关联的攻略被删除时，相关的视频记录也会被级联删除

## 验证方法

表创建完成后，您可以使用以下方法验证：

1. 在Supabase控制台中，点击左侧菜单的"Database"
2. 查看"Tables"列表，确认media_images和media_videos表已存在
3. 可以使用我们创建的测试脚本验证API访问：

```bash
node simple_table_test.js
```

## 注意事项

1. 确保strategies表已经存在，因为media_images和media_videos表有外键关联
2. 如果您的项目使用了不同的数据库架构，请相应地调整SQL语句
3. 创建表后，记得刷新Schema缓存，否则API调用可能仍然找不到表

## 替代方案

如果您有psql命令行工具，也可以使用以下命令执行SQL文件：

```bash
psql "postgresql://postgres:YOUR_PASSWORD@ubgakjfcjnnnksnlxxgj.supabase.co/postgres" -f create_media_tables.sql
```

请将YOUR_PASSWORD替换为您的Supabase数据库密码。