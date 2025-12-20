const { MongoClient } = require('mongodb');

async function resetDatabase() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✓ Kết nối MongoDB thành công!\n');

        const db = client.db('nest');

        // Hiển thị số lượng hiện tại
        const usersCount = await db.collection('users').countDocuments();
        const permissionsCount = await db.collection('permissions').countDocuments();
        const rolesCount = await db.collection('roles').countDocuments();

        console.log('📊 Trạng thái hiện tại:');
        console.log(`   - Users: ${usersCount}`);
        console.log(`   - Permissions: ${permissionsCount}`);
        console.log(`   - Roles: ${rolesCount}\n`);

        // Xóa toàn bộ database
        console.log('🗑️  Đang xóa toàn bộ database...');
        await db.dropDatabase();
        console.log('✅ Đã xóa toàn bộ database thành công!\n');

        console.log('📝 Hướng dẫn tiếp theo:');
        console.log('   1. Restart server NestJS (Ctrl+C rồi npm run start:dev)');
        console.log('   2. Server sẽ tự động seed lại tất cả dữ liệu');
        console.log('   3. Kiểm tra logs để xác nhận seeding thành công\n');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await client.close();
    }
}

resetDatabase();
