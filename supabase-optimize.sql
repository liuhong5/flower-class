-- 数据库优化索引
CREATE INDEX IF NOT EXISTS idx_flowers_class_score ON flowers(class_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_gardens_class_score ON gardens(class_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_scoring_logs_garden_date ON scoring_logs(garden_id, scored_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_flowers_created ON flowers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gardens_created ON gardens(created_at DESC);