import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStrategy28() {
    try {
        console.log('🔍 查询策略ID 28...');
        
        const { data: strategy, error } = await supabase
            .from('strategies')
            .select('*')
            .eq('id', 28)
            .single();
            
        if (error) {
            console.error('查询策略28失败:', error);
            return;
        }
        
        if (strategy) {
            console.log('找到策略28:');
            console.log(`ID: ${strategy.id}`);
            console.log(`标题: ${strategy.title}`);
            console.log(`视频URLs: ${JSON.stringify(strategy.video_urls, null, 2)}`);
            console.log(`内容: ${strategy.content ? strategy.content.substring(0, 100) + '...' : '无内容'}`);
        } else {
            console.log('未找到策略ID 28');
        }
        
        // 查询所有策略，看看最大ID是多少
        const { data: allStrategies, error: allError } = await supabase
            .from('strategies')
            .select('id, title')
            .order('id', { ascending: false })
            .limit(10);
            
        if (allError) {
            console.error('查询所有策略失败:', allError);
        } else {
            console.log('\n最新的10个策略:');
            allStrategies.forEach(s => {
                console.log(`ID: ${s.id}, 标题: ${s.title}`);
            });
        }
        
    } catch (error) {
        console.error('检查过程中出错:', error);
    }
}

checkStrategy28();