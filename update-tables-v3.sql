-- 更新数据库表结构以支持新功能

-- 1. 更新 scoring_logs 表，添加周次和备注字段
ALTER TABLE scoring_logs 
ADD COLUMN IF NOT EXISTS week_number INTEGER,
ADD COLUMN IF NOT EXISTS remark TEXT;

-- 2. 创建注册码表（可选，用于管理注册码）
CREATE TABLE IF NOT EXISTS registration_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_count INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT NULL
);

-- 3. 插入默认注册码
INSERT INTO registration_codes (code, description, max_uses) VALUES
('GARDEN2024', '2024年花园系统注册码', NULL),
('FLOWER123', '花朵管理系统注册码', NULL),
('STUDENT2024', '学生用户注册码', NULL),
('CLASS2024', '班级管理注册码', NULL)
ON CONFLICT (code) DO NOTHING;

-- 4. 创建密码重置请求表（可选，用于记录密码重置请求）
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_by VARCHAR(50),
    reset_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending'
);

-- 5. 更新用户表，添加最后登录时间和手机号码
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(11) UNIQUE;

-- 6. 创建系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 插入默认系统配置
INSERT INTO system_config (config_key, config_value, description) VALUES
('default_password', 'user123', '新用户默认密码'),
('admin_username', 'admin', '默认管理员用户名'),
('admin_password', 'thisweb666', '默认管理员密码'),
('max_weeks', '20', '最大周数设置'),
('registration_enabled', 'true', '是否允许用户注册')
ON CONFLICT (config_key) DO UPDATE SET 
    config_value = EXCLUDED.config_value,
    updated_at = CURRENT_TIMESTAMP;

-- 8. 创建操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    operation VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    details TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. 创建成就记录表
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    flower_id INTEGER,
    garden_id INTEGER,
    class_id INTEGER,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    achievement_description TEXT,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flower_id) REFERENCES flowers(id) ON DELETE CASCADE,
    FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 10. 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. 为新字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_scoring_logs_week ON scoring_logs(week_number);
CREATE INDEX IF NOT EXISTS idx_scoring_logs_garden_week ON scoring_logs(garden_id, week_number);
CREATE INDEX IF NOT EXISTS idx_operation_logs_username ON operation_logs(username);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_notifications_username ON notifications(username);

-- 12. 更新现有数据的默认值
UPDATE users SET login_count = 0 WHERE login_count IS NULL;

-- 13. 创建视图：周表统计
CREATE OR REPLACE VIEW weekly_garden_scores AS
SELECT 
    g.id as garden_id,
    g.name as garden_name,
    c.name as class_name,
    sl.week_number,
    SUM(sl.points) as week_score,
    COUNT(sl.id) as score_count
FROM gardens g
LEFT JOIN classes c ON g.class_id = c.id
LEFT JOIN scoring_logs sl ON g.id = sl.garden_id AND sl.week_number IS NOT NULL
GROUP BY g.id, g.name, c.name, sl.week_number
ORDER BY c.name, g.name, sl.week_number;

-- 14. 创建视图：导出数据格式
CREATE OR REPLACE VIEW export_weekly_data AS
SELECT 
    c.name as class_name,
    g.name as garden_name,
    g.score as total_score,
    COALESCE(w1.week_score, 0) as week_1,
    COALESCE(w2.week_score, 0) as week_2,
    COALESCE(w3.week_score, 0) as week_3,
    COALESCE(w4.week_score, 0) as week_4,
    COALESCE(w5.week_score, 0) as week_5,
    COALESCE(w6.week_score, 0) as week_6,
    COALESCE(w7.week_score, 0) as week_7,
    COALESCE(w8.week_score, 0) as week_8,
    COALESCE(w9.week_score, 0) as week_9,
    COALESCE(w10.week_score, 0) as week_10,
    COALESCE(w11.week_score, 0) as week_11,
    COALESCE(w12.week_score, 0) as week_12,
    COALESCE(w13.week_score, 0) as week_13,
    COALESCE(w14.week_score, 0) as week_14,
    COALESCE(w15.week_score, 0) as week_15,
    COALESCE(w16.week_score, 0) as week_16,
    COALESCE(w17.week_score, 0) as week_17,
    COALESCE(w18.week_score, 0) as week_18,
    COALESCE(w19.week_score, 0) as week_19,
    COALESCE(w20.week_score, 0) as week_20
FROM gardens g
LEFT JOIN classes c ON g.class_id = c.id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 1 GROUP BY garden_id) w1 ON g.id = w1.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 2 GROUP BY garden_id) w2 ON g.id = w2.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 3 GROUP BY garden_id) w3 ON g.id = w3.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 4 GROUP BY garden_id) w4 ON g.id = w4.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 5 GROUP BY garden_id) w5 ON g.id = w5.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 6 GROUP BY garden_id) w6 ON g.id = w6.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 7 GROUP BY garden_id) w7 ON g.id = w7.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 8 GROUP BY garden_id) w8 ON g.id = w8.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 9 GROUP BY garden_id) w9 ON g.id = w9.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 10 GROUP BY garden_id) w10 ON g.id = w10.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 11 GROUP BY garden_id) w11 ON g.id = w11.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 12 GROUP BY garden_id) w12 ON g.id = w12.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 13 GROUP BY garden_id) w13 ON g.id = w13.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 14 GROUP BY garden_id) w14 ON g.id = w14.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 15 GROUP BY garden_id) w15 ON g.id = w15.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 16 GROUP BY garden_id) w16 ON g.id = w16.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 17 GROUP BY garden_id) w17 ON g.id = w17.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 18 GROUP BY garden_id) w18 ON g.id = w18.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 19 GROUP BY garden_id) w19 ON g.id = w19.garden_id
LEFT JOIN (SELECT garden_id, SUM(points) as week_score FROM scoring_logs WHERE week_number = 20 GROUP BY garden_id) w20 ON g.id = w20.garden_id
ORDER BY c.name, g.name;

-- 15. 创建函数：获取花田周表数据
CREATE OR REPLACE FUNCTION get_garden_weekly_scores(garden_id_param INTEGER)
RETURNS TABLE(
    week_number INTEGER,
    total_points INTEGER,
    score_count INTEGER,
    latest_score_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.week_number,
        SUM(sl.points)::INTEGER as total_points,
        COUNT(sl.id)::INTEGER as score_count,
        MAX(sl.scored_at) as latest_score_date
    FROM scoring_logs sl
    WHERE sl.garden_id = garden_id_param 
    AND sl.week_number IS NOT NULL
    GROUP BY sl.week_number
    ORDER BY sl.week_number;
END;
$$ LANGUAGE plpgsql;

-- 16. 创建触发器：记录操作日志
CREATE OR REPLACE FUNCTION log_garden_operations()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO operation_logs (username, operation, target_type, target_id, details)
        VALUES ('system', 'CREATE_GARDEN', 'garden', NEW.id, 
                'Created garden: ' || NEW.name);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.score != NEW.score THEN
            INSERT INTO operation_logs (username, operation, target_type, target_id, details)
            VALUES ('system', 'UPDATE_GARDEN_SCORE', 'garden', NEW.id, 
                    'Score changed from ' || OLD.score || ' to ' || NEW.score);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO operation_logs (username, operation, target_type, target_id, details)
        VALUES ('system', 'DELETE_GARDEN', 'garden', OLD.id, 
                'Deleted garden: ' || OLD.name);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS garden_operations_log ON gardens;
CREATE TRIGGER garden_operations_log
    AFTER INSERT OR UPDATE OR DELETE ON gardens
    FOR EACH ROW EXECUTE FUNCTION log_garden_operations();

-- 17. 插入示例通知
INSERT INTO notifications (username, title, message, type) VALUES
(NULL, '系统更新', '云端花园管理系统已更新到v2.0版本，新增了忘记密码、周表加分、注册码验证等功能！', 'info'),
(NULL, '使用提示', '现在可以通过点击"使用说明"按钮查看详细的操作指南，包括手机端使用方法。', 'tip')
ON CONFLICT DO NOTHING;

-- 18. 更新权限和安全设置
-- 确保RLS（行级安全）策略正确设置
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;

-- 创建基本的RLS策略（允许所有认证用户访问）
CREATE POLICY IF NOT EXISTS "Allow authenticated access" ON users FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated access" ON classes FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated access" ON flowers FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated access" ON gardens FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated access" ON scoring_logs FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated access" ON garden_flowers FOR ALL USING (true);

-- 完成更新
SELECT 'Database update completed successfully!' as status;