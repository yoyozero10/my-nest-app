const { MongoClient } = require('mongodb');
require('dotenv').config();

async function resetDatabase() {
    // Sử dụng MONGO_URL từ .env file
    const uri = process.env.MONGO_URL || 'mongodb+srv://yoyozero9:cclldm123@cluster0.mi2wtoa.mongodb.net/nestjs';

    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    });

    try {
        console.log('🔄 Đang kết nối MongoDB Atlas...');
        await client.connect();
        console.log('✅ Kết nối thành công!\n');

        const db = client.db('nestjs'); // Database name từ connection string

        // Hiển thị số lượng hiện tại
        console.log('📊 Trạng thái hiện tại:');
        try {
            const collections = await db.listCollections().toArray();

            if (collections.length === 0) {
                console.log('   ⚠️  Database trống, chưa có collections nào\n');
            } else {
                for (const col of collections) {
                    const count = await db.collection(col.name).countDocuments();
                    console.log(`   - ${col.name}: ${count} documents`);
                }
                console.log('');
            }
        } catch (e) {
            console.log('   ⚠️  Không thể liệt kê collections:', e.message, '\n');
        }

        // Xóa toàn bộ database
        console.log('🗑️  Đang xóa database "nestjs"...');
        const result = await db.dropDatabase();
        console.log('✅ Đã xóa database thành công!');
        console.log('   Result:', result);
        console.log('');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ THÀNH CÔNG! Database đã được reset');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('📝 BƯỚC TIẾP THEO:');
        console.log('');
        console.log('1️⃣  Khởi động server:');
        console.log('   npm run start:dev');
        console.log('');
        console.log('2️⃣  Đợi server khởi động và kiểm tra logs:');
        console.log('   [DatabasesService] >>> START INIT PERMISSIONS');
        console.log('   [DatabasesService] >>> Created 35 permissions');
        console.log('   [DatabasesService] >>> START INIT ROLES');
        console.log('   [DatabasesService] >>> Created 3 roles');
        console.log('   [DatabasesService] >>> START INIT USERS');
        console.log('   [DatabasesService] >>> Created 10 users');
        console.log('   [DatabasesService] >>> Default password: 123456');
        console.log('');
        console.log('3️⃣  Kiểm tra dữ liệu (sau khi server chạy):');
        console.log('   node check-users-atlas.js');
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ LỖI:', error.message);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');

        if (error.message.includes('authentication')) {
            console.error('💡 Gợi ý: Kiểm tra username/password trong MONGO_URL');
        } else if (error.message.includes('ENOTFOUND')) {
            console.error('💡 Gợi ý: Kiểm tra kết nối internet');
        } else if (error.message.includes('timeout')) {
            console.error('💡 Gợi ý: Kiểm tra IP whitelist trong MongoDB Atlas');
        }

        process.exit(1);
    } finally {
        await client.close();
        console.log('👋 Đã đóng kết nối MongoDB Atlas');
    }
}

// Chạy với timeout
const timeout = setTimeout(() => {
    console.error('');
    console.error('❌ Timeout: Không thể kết nối MongoDB Atlas sau 15 giây');
    console.error('💡 Kiểm tra:');
    console.error('   - Kết nối internet');
    console.error('   - IP whitelist trong MongoDB Atlas');
    console.error('   - Username/password trong connection string');
    process.exit(1);
}, 15000);

resetDatabase().finally(() => {
    clearTimeout(timeout);
});
