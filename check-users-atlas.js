const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkUsers() {
    const uri = process.env.MONGO_URL || 'mongodb+srv://yoyozero9:cclldm123@cluster0.mi2wtoa.mongodb.net/nestjs';
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    });

    try {
        console.log('🔄 Đang kết nối MongoDB Atlas...');
        await client.connect();
        console.log('✅ Kết nối thành công!\n');

        const db = client.db('nestjs');
        const usersCollection = db.collection('users');

        const count = await usersCollection.countDocuments();
        console.log(`📊 Tổng số users trong database: ${count}\n`);

        if (count > 0) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('👥 DANH SÁCH USERS');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            const users = await usersCollection.find({}).toArray();

            // Nhóm theo role
            const adminUsers = users.filter(u => u.role === 'ADMIN');
            const hrUsers = users.filter(u => u.role === 'HR');
            const normalUsers = users.filter(u => u.role === 'USER');

            if (adminUsers.length > 0) {
                console.log('👑 ADMIN USERS:');
                adminUsers.forEach((user, index) => {
                    console.log(`   ${index + 1}. ${user.name}`);
                    console.log(`      📧 Email: ${user.email}`);
                    console.log(`      🎂 Age: ${user.age} | 👤 Gender: ${user.gender}`);
                    console.log(`      📍 Address: ${user.address}`);
                    console.log('');
                });
            }

            if (hrUsers.length > 0) {
                console.log('💼 HR USERS:');
                hrUsers.forEach((user, index) => {
                    console.log(`   ${index + 1}. ${user.name}`);
                    console.log(`      📧 Email: ${user.email}`);
                    console.log(`      🎂 Age: ${user.age} | 👤 Gender: ${user.gender}`);
                    console.log(`      📍 Address: ${user.address}`);
                    console.log('');
                });
            }

            if (normalUsers.length > 0) {
                console.log('👤 NORMAL USERS:');
                normalUsers.forEach((user, index) => {
                    console.log(`   ${index + 1}. ${user.name}`);
                    console.log(`      📧 Email: ${user.email}`);
                    console.log(`      🎂 Age: ${user.age} | 👤 Gender: ${user.gender}`);
                    console.log(`      📍 Address: ${user.address}`);
                    console.log('');
                });
            }

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔑 Password mặc định cho tất cả users: 123456');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } else {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('⚠️  CHƯA CÓ USERS NÀO');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
            console.log('💡 Hướng dẫn:');
            console.log('   1. Khởi động server: npm run start:dev');
            console.log('   2. Server sẽ tự động seed 10 users');
            console.log('   3. Chạy lại script này để kiểm tra');
            console.log('');
        }

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);

        if (error.message.includes('authentication')) {
            console.error('💡 Gợi ý: Kiểm tra username/password trong MONGO_URL');
        } else if (error.message.includes('ENOTFOUND')) {
            console.error('💡 Gợi ý: Kiểm tra kết nối internet');
        }
    } finally {
        await client.close();
        console.log('\n👋 Đã đóng kết nối');
    }
}

checkUsers();
