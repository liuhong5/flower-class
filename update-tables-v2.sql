-- 创建用户表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建花田-花朵关联表（如果不存在）
CREATE TABLE IF NOT EXISTS garden_flowers (
    id SERIAL PRIMARY KEY,
    garden_id INTEGER REFERENCES gardens(id) ON DELETE CASCADE,
    flower_id INTEGER REFERENCES flowers(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(garden_id, flower_id)
);

-- 创建加分记录表（如果不存在）
CREATE TABLE IF NOT EXISTS scoring_logs (
    id SERIAL PRIMARY KEY,
    garden_id INTEGER REFERENCES gardens(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    scored_by VARCHAR(50) NOT NULL,
    scored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例用户（如果不存在）
INSERT INTO users (username, password, role) 
VALUES ('testuser', 'user123', 'user')
ON CONFLICT (username) DO NOTHING;

-- 为现有表添加索引以提高性能
CREATE INDEX IF NOT EXISTS idx_flowers_class_id ON flowers(class_id);
CREATE INDEX IF NOT EXISTS idx_gardens_class_id ON gardens(class_id);
CREATE INDEX IF NOT EXISTS idx_garden_flowers_garden_id ON garden_flowers(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_flowers_flower_id ON garden_flowers(flower_id);
CREATE INDEX IF NOT EXISTS idx_scoring_logs_garden_id ON scoring_logs(garden_id);