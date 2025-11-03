-- 确保所有必要的表都存在

-- 创建花田花朵关联表
CREATE TABLE IF NOT EXISTS garden_flowers (
    id SERIAL PRIMARY KEY,
    garden_id INTEGER REFERENCES gardens(id) ON DELETE CASCADE,
    flower_id INTEGER REFERENCES flowers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(garden_id, flower_id)
);

-- 创建加分记录表（如果不存在）
CREATE TABLE IF NOT EXISTS scoring_logs (
    id SERIAL PRIMARY KEY,
    garden_id INTEGER REFERENCES gardens(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    scored_by VARCHAR(255),
    scored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);