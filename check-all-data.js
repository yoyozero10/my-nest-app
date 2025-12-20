const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkAllCollections() {
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

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 TỔNG QUAN DATABASE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const collections = ['users', 'permissions', 'roles', 'companies', 'jobs', 'resumes'];

        for (const collectionName of collections) {
            try {
                const count = await db.collection(collectionName).countDocuments();
                const icon = count > 0 ? '✅' : '⚠️';
                console.log(`${icon} ${collectionName.padEnd(15)} : ${count} documents`);
            } catch (e) {
                console.log(`❌ ${collectionName.padEnd(15)} : Error - ${e.message}`);
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 CHI TIẾT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Users by role
        const usersByRole = await db.collection('users').aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        if (usersByRole.length > 0) {
            console.log('👥 Users theo Role:');
            usersByRole.forEach(item => {
                console.log(`   - ${item._id}: ${item.count}`);
            });
            console.log('');
        }

        // Companies
        const companies = await db.collection('companies').find().limit(5).toArray();
        if (companies.length > 0) {
            console.log('🏢 Companies:');
            companies.forEach((c, i) => {
                console.log(`   ${i + 1}. ${c.name} - ${c.address}`);
            });
            console.log('');
        }

        // Jobs by level
        const jobsByLevel = await db.collection('jobs').aggregate([
            { $group: { _id: '$level', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        if (jobsByLevel.length > 0) {
            console.log('💼 Jobs theo Level:');
            jobsByLevel.forEach(item => {
                console.log(`   - ${item._id}: ${item.count}`);
            });
            console.log('');
        }

        // Resumes by status
        const resumesByStatus = await db.collection('resumes').aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        if (resumesByStatus.length > 0) {
            console.log('📄 Resumes theo Status:');
            resumesByStatus.forEach(item => {
                console.log(`   - ${item._id}: ${item.count}`);
            });
            console.log('');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
    } finally {
        await client.close();
        console.log('\n👋 Đã đóng kết nối');
    }
}

checkAllCollections();
