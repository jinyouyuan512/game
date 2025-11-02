-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  role VARCHAR(20) DEFAULT 'admin',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建管理员操作日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_detail TEXT,
  target_id INTEGER,
  target_type VARCHAR(50),
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- 创建AI对话记录表
CREATE TABLE IF NOT EXISTS ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  conversation_id VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tokens_used INTEGER,
  duration_ms INTEGER,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES admins(id)
);

-- 创建管理员会话表
CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  session_token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- 插入默认管理员账号 (密码: admin123)
INSERT INTO admins (username, password, email, role) 
VALUES ('admin', '$2b$10$eWzQvXWzQvXWzQvXWzQveWzQvXWzQvXWzQvXWzQvXWzQvXWzQv', 'admin@example.com', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- 插入一些默认系统设置
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('site_name', '游戏攻略平台', '网站名称'),
('site_description', '专业的游戏攻略分享社区', '网站描述'),
('max_upload_size', '5242880', '最大上传文件大小（字节）'),
('ai_model', 'gpt-3.5-turbo', '使用的AI模型'),
('maintenance_mode', 'false', '维护模式开关'),
('page_size', '10', '分页大小')
ON CONFLICT (setting_key) DO NOTHING;