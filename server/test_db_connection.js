// 数据库连接测试脚本
// 此脚本用于验证Supabase连接是否正常工作

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('开始测试Supabase连接...');
  console.log(`连接URL: ${supabaseUrl}`);
  console.log(`密钥: ${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 10)}`);
  
  try {
    // 尝试查询games表测试连接
    const { data, error } = await supabase
      .from('games')
      .select('id, name')
      .limit(5);

    if (error) {
      console.error('❌ 查询失败:', error.message);
      
      // 提供常见错误的可能解决方案
      if (error.message.includes('Could not find the table')) {
        console.log('\n📋 可能的解决方案:');
        console.log('1. 确保您已在Supabase中运行了supabase_migration.sql脚本');
        console.log('2. 检查表名是否正确（区分大小写）');
        console.log('3. 确认您的Supabase角色有足够的权限访问这些表');
      }
      return false;
    }

    console.log('✅ 连接成功! 查询结果:');
    if (data.length > 0) {
      console.log('找到的游戏数据:');
      data.forEach(game => {
        console.log(`  - ${game.id}: ${game.name}`);
      });
    } else {
      console.log('数据库连接正常，但games表中没有数据');
    }
    
    // 测试其他几个关键表
    const tables = ['users', 'strategies', 'tags'];
    for (const table of tables) {
      console.log(`\n📊 检查${table}表...`);
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error(`❌ ${table}表查询失败:`, tableError.message);
      } else {
        console.log(`✅ ${table}表可正常访问`);
      }
    }
    
    return true;
  } catch (err) {
    console.error('❌ 连接测试发生错误:', err.message);
    return false;
  }
}

// 运行测试
(async () => {
  const success = await testConnection();
  console.log('\n==================================');
  if (success) {
    console.log('🎉 所有测试通过! Supabase连接正常。');
  } else {
    console.log('🔴 部分测试失败，请检查错误信息。');
    console.log('🔄 应用程序将使用模拟数据作为备用。');
  }
})();