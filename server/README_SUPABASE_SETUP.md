# Supabase 设置指南

本指南提供了在Supabase中设置数据库所需的步骤，确保应用程序能够成功连接并使用Supabase数据库。

## 前提条件

1. 已创建Supabase账户
2. 已创建Supabase项目
3. 已获取项目的SUPABASE_URL和SUPABASE_ANON_KEY

## 数据库设置步骤

### 方法一：使用SQL迁移脚本（推荐）

1. 登录到Supabase控制台（https://app.supabase.com/）
2. 选择您的项目
3. 导航到左侧菜单中的"SQL编辑器"
4. 复制`supabase_migration.sql`文件的内容到SQL编辑器中
5. 点击"运行"按钮执行SQL脚本
6. 等待脚本执行完成，所有表和示例数据将被创建

### 方法二：手动创建表（可选）

如果您希望手动创建表而不使用迁移脚本，请按照以下步骤操作：

1. 登录到Supabase控制台
2. 导航到"数据库" -> "表编辑器" -> "创建新表"
3. 按照下面的表结构定义，逐个创建所有必要的表

## 表结构说明

### 1. users（用户表）

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| id | SERIAL | PRIMARY KEY | 用户ID（自增） |
| username | VARCHAR(255) | NOT NULL UNIQUE | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（注：生产环境应加密存储） |
| email | VARCHAR(255) | UNIQUE | 邮箱地址 |

### 2. games（游戏表）

| 字段名 | 数据类型 | 约束 | 默认值 | 描述 |
|-------|---------|------|-------|------|
| id | SERIAL | PRIMARY KEY | | 游戏ID（自增） |
| name | VARCHAR(255) | NOT NULL | | 游戏名称 |
| description | TEXT | | | 游戏描述 |
| image | VARCHAR(255) | | | 游戏图片URL |
| coverImage | VARCHAR(255) | | | 游戏封面图片URL（兼容mockData） |
| status | VARCHAR(50) | | 'active' | 游戏状态 |
| platform | VARCHAR(255) | | | 游戏平台（兼容mockData） |
| developer | VARCHAR(255) | | | 游戏开发商（兼容mockData） |
| publisher | VARCHAR(255) | | | 游戏发行商（兼容mockData） |
| created_at | TIMESTAMP | | CURRENT_TIMESTAMP | 创建时间 |

### 3. strategies（攻略表）

| 字段名 | 数据类型 | 约束 | 默认值 | 描述 |
|-------|---------|------|-------|------|
| id | SERIAL | PRIMARY KEY | | 攻略ID（自增） |
| title | VARCHAR(255) | NOT NULL | | 攻略标题 |
| content | TEXT | NOT NULL | | 攻略内容 |
| game_id | INTEGER | NOT NULL | | 关联游戏ID |
| user_id | INTEGER | NOT NULL | | 作者用户ID |
| status | VARCHAR(50) | | 'published' | 攻略状态 |
| view_count | INTEGER | | 0 | 浏览次数 |
| difficulty | VARCHAR(50) | | | 难度等级（兼容mockData） |
| type | VARCHAR(50) | | | 攻略类型（兼容mockData） |
| created_at | TIMESTAMP | | CURRENT_TIMESTAMP | 创建时间 |

外键约束：
- `game_id` REFERENCES `games(id)`
- `user_id` REFERENCES `users(id)`

### 4. tags（标签表）

| 字段名 | 数据类型 | 约束 | 默认值 | 描述 |
|-------|---------|------|-------|------|
| id | SERIAL | PRIMARY KEY | | 标签ID（自增） |
| name | VARCHAR(255) | NOT NULL | | 标签名称 |
| color | VARCHAR(20) | | '#409EFF' | 标签颜色 |

### 5. strategy_tags（攻略标签关联表）

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| strategy_id | INTEGER | NOT NULL | 攻略ID |
| tag_id | INTEGER | NOT NULL | 标签ID |

主键约束：`(strategy_id, tag_id)`
外键约束：
- `strategy_id` REFERENCES `strategies(id)`
- `tag_id` REFERENCES `tags(id)`

### 6. notes（笔记表）

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| id | SERIAL | PRIMARY KEY | 笔记ID（自增） |
| title | VARCHAR(255) | NOT NULL | 笔记标题 |
| content | TEXT | NOT NULL | 笔记内容 |
| user_id | INTEGER | NOT NULL | 关联用户ID |

外键约束：
- `user_id` REFERENCES `users(id)`

## 应用程序配置

确保`server/.env`文件包含正确的Supabase连接信息：

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## 权限设置

为了确保应用程序能够正常访问数据，需要在Supabase中配置适当的权限：

1. 导航到左侧菜单中的"认证" -> "策略"
2. 为每个表配置适当的行级安全策略（RLS）
3. 对于开发环境，可以临时禁用RLS以简化设置

## 注意事项

1. 密码安全：在生产环境中，用户密码应该使用bcrypt等安全哈希算法进行加密存储
2. 环境变量：SUPABASE_URL和SUPABASE_ANON_KEY是敏感信息，不应硬编码在代码中
3. 权限管理：生产环境应实施严格的行级安全策略，限制对数据的访问
4. 备份：定期备份Supabase数据库以防止数据丢失

## 故障排除

如果应用程序仍然无法连接到Supabase，请检查：

1. SUPABASE_URL和SUPABASE_ANON_KEY是否正确
2. 表名和字段名是否与应用程序中的模型定义一致
3. 数据库权限设置是否正确
4. 网络连接是否正常，确保没有防火墙阻止连接

如果以上方法都无法解决问题，应用程序会自动切换到使用模拟数据模式，确保应用程序仍然可以运行和展示功能。