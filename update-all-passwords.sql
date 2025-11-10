-- 更新所有用户密码为统一值
UPDATE users SET password = 'thisweb666';

-- 确认更新结果
SELECT username, role, password FROM users;
