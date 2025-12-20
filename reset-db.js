const { MongoClient } = require('mongodb');

async function resetDatabase() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
    });

    try {
        console.log('🔄 Đang kết nối MongoDB...');
        await client.connect();
        console.log('✓ Kết nối thành công!\n');

        const db = client.db('nest');

        // Hiển thị số lượng hiện tại
        try {
            const collections = await db.listCollections().toArray();
            console.log('📊 Collections hiện tại:');
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`   - ${col.name}: ${count} documents`);
            }
            console.log('');
        } catch (e) {
            console.log('⚠️  Không thể đếm documents\n');
        }

        // Xóa toàn bộ database
        console.log('🗑️  Đang xóa database "nest"...');
        const result = await db.dropDatabase();
        console.log('✅ Đã xóa database thành công!');
        console.log('   Result:', result);
        console.log('');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 BƯỚC TIẾP THEO:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. Chạy: npm run start:dev');
        console.log('2. Đợi server khởi động');
        console.log('3. Kiểm tra logs để thấy:');
        console.log('   >>> START INIT PERMISSIONS');
        console.log('   >>> Created 35 permissions');
        console.log('   >>> START INIT ROLES');
        console.log('   >>> Created 3 roles');
        console.log('   >>> START INIT USERS');
        console.log('   >>> Created 10 users');
        console.log('   >>> Default password for all users: 123456');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    } finally {
        await client.close();
        console.log('👋 Đã đóng kết nối MongoDB');
        process.exit(0);
    }
}

// Chạy với timeout
const timeout = setTimeout(() => {
    console.error('❌ Timeout: Không thể kết nối MongoDB sau 10 giây');
    process.exit(1);
}, 10000);

resetDatabase().finally(() => {
    clearTimeout(timeout);
});
