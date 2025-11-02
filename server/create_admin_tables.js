// 使用Supabase客户端直接操作数据库
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 创建Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 检查表是否存在
async function tableExists(tableName) {
  try {
    // 尝试查询表，只获取1条记录
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    // 如果没有错误，表存在
    if (!error) {
      return true;
    }
    
    // 检查错误是否是表不存在
    if (error.code === '42P01') { // PostgreSQL错误码：表不存在
      return false;
    }
    
    // 其他错误，记录并返回false
    console.error(`检查表 ${tableName} 时出错:`, error.message);
    return false;
  } catch (err) {
    console.error(`检查表 ${tableName} 时发生异常:`, err.message);
    return false;
  }
}

// 执行SQL脚本函数
async function initializeAdminTables() {
  try {
    console.log('正在初始化管理员数据表...');
    console.log(`使用Supabase连接: ${supabaseUrl}`);
    
    // 检查表是否已存在
    const adminsExists = await tableExists('admins');
    const adminLogsExists = await tableExists('admin_logs');
    const aiConversationsExists = await tableExists('ai_conversations');
    const systemSettingsExists = await tableExists('system_settings');
    const adminSessionsExists = await tableExists('admin_sessions');
    
    console.log('\n表检查结果:');
    console.log(`- admins 表: ${adminsExists ? '已存在' : '不存在'}`);
    console.log(`- admin_logs 表: ${adminLogsExists ? '已存在' : '不存在'}`);
    console.log(`- ai_conversations 表: ${aiConversationsExists ? '已存在' : '不存在'}`);
    console.log(`- system_settings 表: ${systemSettingsExists ? '已存在' : '不存在'}`);
    console.log(`- admin_sessions 表: ${adminSessionsExists ? '已存在' : '不存在'}`);
    
    // 如果所有表都已存在，尝试插入默认数据
    if (adminsExists && systemSettingsExists) {
      console.log('\n所有必要的表已存在，尝试插入默认数据...');
      
      // 尝试插入默认管理员账号
      try {
        const { data, error } = await supabase
          .from('admins')
          .insert([{
            username: 'admin',
            password: '$2b$10$eWzQvXWzQvXWzQvXWzQveWzQvXWzQvXWzQvXWzQvXWzQvXWzQv',
            email: 'admin@example.com',
            role: 'superadmin'
          }])
          .select()
          .single();
        
        if (error) {
          if (error.code === '23505') { // 唯一约束冲突
            console.log('默认管理员账号已存在，跳过插入');
          } else {
            console.error('插入默认管理员账号失败:', error.message);
          }
        } else {
          console.log('默认管理员账号插入成功');
        }
      } catch (err) {
        console.error('插入默认管理员账号时发生异常:', err.message);
      }
      
      // 尝试插入默认系统设置
      const defaultSettings = [
        { setting_key: 'site_name', setting_value: '游戏攻略平台', description: '网站名称' },
        { setting_key: 'site_description', setting_value: '专业的游戏攻略分享社区', description: '网站描述' },
        { setting_key: 'max_upload_size', setting_value: '5242880', description: '最大上传文件大小（字节）' },
        { setting_key: 'ai_model', setting_value: 'gpt-3.5-turbo', description: '使用的AI模型' },
        { setting_key: 'maintenance_mode', setting_value: 'false', description: '维护模式开关' },
        { setting_key: 'page_size', setting_value: '10', description: '分页大小' }
      ];
      
      for (const setting of defaultSettings) {
        try {
          const { error } = await supabase
            .from('system_settings')
            .insert([setting])
            .select();
          
          if (error) {
            if (error.code === '23505') { // 唯一约束冲突
              console.log(`设置 ${setting.setting_key} 已存在，跳过插入`);
            } else {
              console.error(`插入设置 ${setting.setting_key} 失败:`, error.message);
            }
          } else {
            console.log(`设置 ${setting.setting_key} 插入成功`);
          }
        } catch (err) {
          console.error(`插入设置 ${setting.setting_key} 时发生异常:`, err.message);
        }
      }
    } else {
      console.log('\n警告: 检测到缺少必要的表');
      console.log('由于Supabase不支持直接执行SQL创建表，您需要通过以下方式创建表:');
      console.log('1. 登录Supabase控制台');
      console.log('2. 导航到SQL编辑器');
      console.log('3. 执行create_admin_tables.sql中的SQL语句');
      console.log('\n请确保执行以下表的创建SQL:');
      
      if (!adminsExists) console.log('- admins 表');
      if (!adminLogsExists) console.log('- admin_logs 表');
      if (!aiConversationsExists) console.log('- ai_conversations 表');
      if (!systemSettingsExists) console.log('- system_settings 表');
      if (!adminSessionsExists) console.log('- admin_sessions 表');
    }
    
    console.log('\n管理员数据表初始化检查完成!\n');
    console.log('注意:');
    console.log('- 由于Supabase API限制，无法通过客户端直接创建表结构');
    console.log('- 请通过Supabase控制台的SQL编辑器执行create_admin_tables.sql中的SQL语句');
    console.log('- 默认管理员账号: admin / admin123');
    
  } catch (error) {
    console.error('初始化管理员数据表时出错:', error.message);
    console.error('错误详情:', error.stack);
    process.exit(1);
  }
}

// 运行初始化
console.log('开始管理员数据表初始化...');
initializeAdminTables();