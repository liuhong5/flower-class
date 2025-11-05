-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 插入示例班级数据
INSERT INTO classes (name) VALUES 
    ('一年级一班'),
    ('一年级二班'),
    ('二年级一班');

-- 插入管理员账号 (用户名: admin, 密码: thisweb666)
INSERT INTO users (username, password, role) VALUES 
    ('admin', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'editor')
ON CONFLICT (username) DO NOTHING;

-- 为每个班级插入一些示例花朵
INSERT INTO flowers (name, class_id, score) 
SELECT '小明', c.id, 5 FROM classes c WHERE c.name = '一年级一班'
UNION ALL
SELECT '小红', c.id, 8 FROM classes c WHERE c.name = '一年级一班'
UNION ALL
SELECT '小刚', c.id, 3 FROM classes c WHERE c.name = '一年级一班'
UNION ALL
SELECT '小丽', c.id, 12 FROM classes c WHERE c.name = '一年级二班'
UNION ALL
SELECT '小华', c.id, 7 FROM classes c WHERE c.name = '一年级二班'
UNION ALL
SELECT '小强', c.id, 15 FROM classes c WHERE c.name = '二年级一班';

-- 插入示例花田
INSERT INTO gardens (name, class_id, score) 
SELECT '阳光花田', c.id, 25 FROM classes c WHERE c.name = '一年级一班'
UNION ALL
SELECT '彩虹花田', c.id, 30 FROM classes c WHERE c.name = '一年级二班'
UNION ALL
SELECT '希望花田', c.id, 18 FROM classes c WHERE c.name = '二年级一班';