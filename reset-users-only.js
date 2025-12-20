const { MongoClient } = require('mongodb');

async function resetUsersOnly() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✓ Kết nối MongoDB thành công!\n');

        const db = client.db('nest');

        // Hiển thị số lượng hiện tại
        const usersCount = await db.collection('users').countDocuments();

        console.log('📊 Trạng thái hiện tại:');
        console.log(`   - Users: ${usersCount}\n`);

        // Xóa chỉ collection users
        console.log('🗑️  Đang xóa collection users...');
        await db.collection('users').drop();
        console.log('✅ Đã xóa collection users thành công!\n');

        console.log('⚠️  LƯU Ý:');
        console.log('   - Permissions và Roles vẫn còn trong database');
        console.log('   - Server sẽ KHÔNG tự động seed lại users');
        console.log('   - Bạn cần xóa toàn bộ database để seed lại\n');

        console.log('📝 Để seed lại users:');
        console.log('   1. Chạy: node reset-database.js');
        console.log('   2. Restart server NestJS\n');

    } catch (error) {
        if (error.message.includes('ns not found')) {
            console.log('⚠️  Collection users không tồn tại');
        } else {
            console.error('❌ Lỗi:', error.message);
        }
    } finally {
        await client.close();
    }
}

resetUsersOnly();
