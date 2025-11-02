# 媒体文件存储功能文档

本项目已实现新的媒体文件存储功能，将图片和视频文件信息存储在独立的表中，通过外键与攻略表关联。

## 数据库结构

添加了两个新表来存储媒体文件信息：

### 1. media_images 表 - 图片文件存储

```sql
CREATE TABLE media_images (
    id SERIAL PRIMARY KEY,
    strategy_id INTEGER NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE
);
```

### 2. media_videos 表 - 视频文件存储

```sql
CREATE TABLE media_videos (
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
```

## 数据库迁移步骤

### 方法一：手动执行SQL脚本

1. 打开Supabase控制台
2. 进入SQL编辑器
3. 复制 `create_media_tables.sql` 文件的内容并执行

### 方法二：使用命令行工具

```bash
# 使用psql工具执行迁移
psql "your-supabase-database-url" -f create_media_tables.sql
```

## 功能说明

### 1. 攻略创建时的媒体存储

当创建新攻略时：
- 首先保存攻略基本信息到 `strategies` 表
- 然后将图片信息保存到 `media_images` 表
- 最后将视频信息保存到 `media_videos` 表

### 2. 攻略查询时的媒体获取

当查询攻略详情时：
- 从 `strategies` 表获取基本信息
- 从 `media_images` 表获取关联的图片信息
- 从 `media_videos` 表获取关联的视频信息
- 将媒体信息整合到返回结果中

## API 响应格式

创建攻略和获取攻略详情的响应中包含以下媒体相关字段：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "攻略标题",
    "content": "攻略内容",
    "image_urls": ["/uploads/images/xxx.jpg", "/uploads/images/yyy.jpg"],
    "video_urls": ["/uploads/videos/zzz.mp4"],
    // 其他字段...
  },
  "mediaStats": {
    "images": 2,
    "videos": 1
  }
}
```

## 测试方法

### 运行测试脚本

```bash
# 在项目根目录执行
node test_media_storage.js
```

这个测试脚本会：
1. 创建一个包含图片和视频的攻略
2. 查询该攻略的详情
3. 验证媒体信息是否正确存储和获取

## 注意事项

1. **级联删除**：当攻略被删除时，相关的媒体文件记录会自动删除（通过 `ON DELETE CASCADE` 约束）
2. **索引优化**：已为外键字段添加索引，提高查询性能
3. **文件清理**：当前实现不会自动删除上传到文件系统的媒体文件，需要定期清理
4. **错误处理**：如果媒体表插入失败，会在服务器日志中记录详细错误信息

## 扩展建议

1. 添加媒体文件的更新和删除功能
2. 实现视频时长提取功能
3. 添加媒体文件的缩略图生成功能
4. 优化大文件上传体验（分块上传、进度显示等）