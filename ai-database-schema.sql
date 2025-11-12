-- AI功能相关数据库表结构

-- AI使用日志表
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    request_type VARCHAR(50) NOT NULL, -- 'qa', 'summary', 'moderate', 'search'
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0.00,
    response_time INTEGER, -- 响应时间(毫秒)
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI会话记录表
CREATE TABLE IF NOT EXISTS ai_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id VARCHAR(255) NOT NULL,
    message_type VARCHAR(20) NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    context JSONB, -- 上下文信息
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI内容审核记录表
CREATE TABLE IF NOT EXISTS ai_moderation_logs (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL, -- 'strategy', 'comment', 'post'
    content_id INTEGER,
    original_content TEXT NOT NULL,
    moderation_result JSONB NOT NULL, -- {safe: boolean, reason: string, confidence: float}
    action_taken VARCHAR(50), -- 'approved', 'rejected', 'flagged'
    reviewed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI推荐记录表
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    recommendation_type VARCHAR(50) NOT NULL, -- 'strategy', 'game', 'content'
    item_id INTEGER NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    score DECIMAL(3, 2), -- 推荐分数 0.00-1.00
    reason TEXT, -- 推荐原因
    clicked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI配置表
CREATE TABLE IF NOT EXISTS ai_configurations (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI服务状态表
CREATE TABLE IF NOT EXISTS ai_service_status (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'local'
    status VARCHAR(20) NOT NULL, -- 'active', 'inactive', 'error'
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    response_time INTEGER, -- 平均响应时间
    success_rate DECIMAL(5, 2) -- 成功率百分比
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_request_type ON ai_usage_logs(request_type);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_content_type ON ai_moderation_logs(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_created_at ON ai_moderation_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_item_type ON ai_recommendations(item_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at);

-- 插入默认AI配置
INSERT INTO ai_configurations (config_key, config_value, description) VALUES
('ai_rate_limits', '{"requests_per_minute": 60, "requests_per_hour": 1000, "requests_per_day": 10000}', 'AI服务速率限制配置'),
('ai_models', '{"default": "gpt-3.5-turbo", "premium": "gpt-4", "local": "llama2"}', 'AI模型配置'),
('ai_prompts', '{"qa_system": "你是一个专业的游戏攻略助手", "summary_system": "请生成简洁的攻略摘要", "moderation_system": "请检查内容是否合规"}', 'AI提示词配置'),
('ai_costs', '{"gpt-3.5-turbo": {"input": 0.0015, "output": 0.002}, "gpt-4": {"input": 0.03, "output": 0.06}}', 'AI服务成本配置')
ON CONFLICT (config_key) DO NOTHING;

-- 创建AI使用统计视图
CREATE OR REPLACE VIEW ai_usage_stats AS
SELECT 
    DATE(created_at) as usage_date,
    request_type,
    COUNT(*) as request_count,
    SUM(tokens_used) as total_tokens,
    SUM(cost) as total_cost,
    AVG(response_time) as avg_response_time,
    SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as success_rate
FROM ai_usage_logs
GROUP BY DATE(created_at), request_type
ORDER BY usage_date DESC, request_type;

-- 创建用户AI使用统计视图
CREATE OR REPLACE VIEW user_ai_usage_stats AS
SELECT 
    user_id,
    COUNT(*) as total_requests,
    SUM(tokens_used) as total_tokens,
    SUM(cost) as total_cost,
    COUNT(DISTINCT DATE(created_at)) as active_days,
    MAX(created_at) as last_usage,
    AVG(CASE WHEN success THEN response_time END) as avg_response_time
FROM ai_usage_logs
GROUP BY user_id;

-- 创建AI服务健康检查函数
CREATE OR REPLACE FUNCTION check_ai_service_health()
RETURNS TABLE(
    service_name VARCHAR(100),
    status VARCHAR(20),
    uptime_percentage DECIMAL(5,2),
    avg_response_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ass.service_name,
        ass.status,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (SUM(CASE WHEN aul.success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100)::DECIMAL(5,2)
            ELSE 0.00
        END as uptime_percentage,
        COALESCE(AVG(aul.response_time)::INTEGER, 0) as avg_response_time
    FROM ai_service_status ass
    LEFT JOIN ai_usage_logs aul ON aul.created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY ass.service_name, ass.status;
END;
$$ LANGUAGE plpgsql;