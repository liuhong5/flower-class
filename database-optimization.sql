-- 数据库性能优化
-- 添加索引优化查询性能

-- 花朵表索引
CREATE INDEX IF NOT EXISTS idx_flowers_class_id ON flowers(class_id);
CREATE INDEX IF NOT EXISTS idx_flowers_score ON flowers(score DESC);
CREATE INDEX IF NOT EXISTS idx_flowers_created_at ON flowers(created_at);
CREATE INDEX IF NOT EXISTS idx_flowers_name ON flowers(name);

-- 花田表索引
CREATE INDEX IF NOT EXISTS idx_gardens_class_id ON gardens(class_id);
CREATE INDEX IF NOT EXISTS idx_gardens_score ON gardens(score DESC);
CREATE INDEX IF NOT EXISTS idx_gardens_created_at ON gardens(created_at);

-- 班级表索引
CREATE INDEX IF NOT EXISTS idx_classes_name ON classes(name);
CREATE INDEX IF NOT EXISTS idx_classes_created_at ON classes(created_at);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 花田花朵关联表索引
CREATE INDEX IF NOT EXISTS idx_garden_flowers_garden_id ON garden_flowers(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_flowers_flower_id ON garden_flowers(flower_id);

-- 操作历史表（如果存在）
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_history_class_id ON history(class_id);
CREATE INDEX IF NOT EXISTS idx_history_action_type ON history(action_type);

-- 成就表索引（如果存在）
CREATE INDEX IF NOT EXISTS idx_achievements_student_id ON achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_achievements_achievement_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked_at ON achievements(unlocked_at DESC);

-- 复合索引优化常用查询
CREATE INDEX IF NOT EXISTS idx_flowers_class_score ON flowers(class_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_gardens_class_score ON gardens(class_id, score DESC);

-- 分区表优化（PostgreSQL）
-- 按月分区历史记录表
CREATE TABLE IF NOT EXISTS history_partitioned (
    id SERIAL,
    class_id INTEGER,
    action_type VARCHAR(50),
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (timestamp);

-- 创建月度分区
CREATE TABLE IF NOT EXISTS history_2024_01 PARTITION OF history_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 物化视图优化排行榜查询
CREATE MATERIALIZED VIEW IF NOT EXISTS flower_rankings AS
SELECT 
    f.id,
    f.name,
    f.score,
    f.class_id,
    c.name as class_name,
    ROW_NUMBER() OVER (PARTITION BY f.class_id ORDER BY f.score DESC) as rank_in_class,
    ROW_NUMBER() OVER (ORDER BY f.score DESC) as global_rank
FROM flowers f
JOIN classes c ON f.class_id = c.id
ORDER BY f.score DESC;

CREATE MATERIALIZED VIEW IF NOT EXISTS garden_rankings AS
SELECT 
    g.id,
    g.name,
    g.score,
    g.class_id,
    c.name as class_name,
    ROW_NUMBER() OVER (PARTITION BY g.class_id ORDER BY g.score DESC) as rank_in_class,
    ROW_NUMBER() OVER (ORDER BY g.score DESC) as global_rank
FROM gardens g
JOIN classes c ON g.class_id = c.id
ORDER BY g.score DESC;

-- 定期刷新物化视图的函数
CREATE OR REPLACE FUNCTION refresh_rankings()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW flower_rankings;
    REFRESH MATERIALIZED VIEW garden_rankings;
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务刷新排行榜（需要pg_cron扩展）
-- SELECT cron.schedule('refresh-rankings', '*/5 * * * *', 'SELECT refresh_rankings();');

-- 查询缓存表
CREATE TABLE IF NOT EXISTS query_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    cache_value JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_query_cache_expires ON query_cache(expires_at);

-- 清理过期缓存的函数
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM query_cache WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- 统计信息更新
ANALYZE flowers;
ANALYZE gardens;
ANALYZE classes;
ANALYZE users;

-- 数据库配置优化建议（需要数据库管理员权限）
/*
-- 调整PostgreSQL配置参数
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- 重新加载配置
SELECT pg_reload_conf();
*/