const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zxwweootybxjcdyqfpms.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4d3dlb290eWJ4amNkeXFmcG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODAxMjcsImV4cCI6MjA3Nzc1NjEyN30.q8x1Smz7USlrHuyxMIxZwlssXKntoaKOc-1PLh3jeH4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  try {
    // 删除旧的管理员账号
    await supabase.from('users').delete().eq('role', 'editor');
    
    // 创建新的管理员账号
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: 'Englishadmin',
        password: 'thisweb666',
        role: 'editor'
      }]);
    
    if (error) {
      console.error('创建管理员失败:', error);
    } else {
      console.log('✅ 管理员账号创建成功');
      console.log('用户名: Englishadmin');
      console.log('密码: thisweb666');
    }
  } catch (error) {
    console.error('操作失败:', error);
  }
}

createAdmin();