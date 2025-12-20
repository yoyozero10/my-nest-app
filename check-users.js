const { MongoClient } = require('mongodb');

async function checkUsers() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✓ Kết nối MongoDB thành công!');

        const db = client.db('nest');
        const usersCollection = db.collection('users');

        const count = await usersCollection.countDocuments();
        console.log(`\n📊 Tổng số users trong database: ${count}`);

        if (count > 0) {
            console.log('\n👥 Danh sách users:\n');
            const users = await usersCollection.find({}).toArray();

            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Age: ${user.age}`);
                console.log(`   Gender: ${user.gender}`);
                console.log(`   Address: ${user.address}`);
                console.log('');
            });

            console.log('✅ Password mặc định cho tất cả users: 123456');
        } else {
            console.log('\n⚠️  Chưa có users nào trong database');
            console.log('💡 Server sẽ tự động seed data khi khởi động lần đầu');
        }

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await client.close();
    }
}

checkUsers();
