-- 创建班级表
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建花朵表
CREATE TABLE IF NOT EXISTS flowers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建花田表
CREATE TABLE IF NOT EXISTS gardens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建花田花朵关联表
CREATE TABLE IF NOT EXISTS garden_flowers (
    id SERIAL PRIMARY KEY,
    garden_id INTEGER REFERENCES gardens(id) ON DELETE CASCADE,
    flower_id INTEGER REFERENCES flowers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(garden_id, flower_id)
);

-- 创建浇水记录表
CREATE TABLE IF NOT EXISTS watering_logs (
    id SERIAL PRIMARY KEY,
    flower_id INTEGER REFERENCES flowers(id) ON DELETE CASCADE,
    watered_by VARCHAR(255),
    watered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建加分记录表
CREATE TABLE IF NOT EXISTS scoring_logs (
    id SERIAL PRIMARY KEY,
    garden_id INTEGER REFERENCES gardens(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    scored_by VARCHAR(255),
    scored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入示例数据
INSERT INTO classes (name) VALUES 
    ('一年级一班'),
    ('一年级二班'),
    ('二年级一班')
ON CONFLICT DO NOTHING;

-- 为每个班级插入一些示例花朵
INSERT INTO flowers (name, class_id, score) VALUES 
    ('小明', 1, 5),
    ('小红', 1, 8),
    ('小刚', 1, 3),
    ('小丽', 2, 12),
    ('小华', 2, 7),
    ('小强', 3, 15)
ON CONFLICT DO NOTHING;

-- 插入示例花田
INSERT INTO gardens (name, class_id, score) VALUES 
    ('阳光花田', 1, 25),
    ('彩虹花田', 2, 30),
    ('希望花田', 3, 18)
ON CONFLICT DO NOTHING;