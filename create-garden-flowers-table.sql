-- 创建花田花朵关联表
CREATE TABLE IF NOT EXISTS garden_flowers (
    id SERIAL PRIMARY KEY,
    garden_id INTEGER REFERENCES gardens(id) ON DELETE CASCADE,
    flower_id INTEGER REFERENCES flowers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(garden_id, flower_id)
);