// Script test Mail Service
// Chạy: node test-mail.js

const baseUrl = 'http://localhost:8000/api/v1';

async function testMailService() {
    console.log('========================================');
    console.log('TEST MAIL SERVICE');
    console.log('========================================\n');

    // 1. Test endpoint
    console.log('1. Kiểm tra Mail service...');
    try {
        const response = await fetch(`${baseUrl}/mail/test`);
        const data = await response.json();
        console.log('✓ Mail service đang hoạt động!');
        console.log('Response:', JSON.stringify(data, null, 2), '\n');
    } catch (error) {
        console.log('✗ Lỗi:', error.message, '\n');
        return;
    }

    // 2. Gửi email đơn giản
    console.log('2. Gửi email đơn giản...');
    console.log('⚠️  Lưu ý: Cần cấu hình MAIL_USER và MAIL_PASS trong .env trước!');

    const emailAddress = 'thnhctdxhbt@gmail.com'; // Thay bằng email thật để test

    try {
        const response = await fetch(`${baseUrl}/mail/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: emailAddress,
                subject: 'Test Email từ NestJS App',
                text: 'Đây là email test từ NestJS Mail Service',
                html: '<h1>Test Email</h1><p>Đây là email test từ <strong>NestJS Mail Service</strong></p>'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✓ Gửi email thành công!');
            console.log('Response:', JSON.stringify(data, null, 2), '\n');
        } else {
            console.log('✗ Gửi email thất bại!');
            console.log('Error:', JSON.stringify(data, null, 2), '\n');
        }
    } catch (error) {
        console.log('✗ Lỗi:', error.message, '\n');
    }

    // 3. Gửi email chào mừng
    console.log('3. Gửi email chào mừng...');
    try {
        const response = await fetch(`${baseUrl}/mail/welcome`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: emailAddress,
                name: 'Nguyễn Văn A'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✓ Gửi email chào mừng thành công!');
            console.log('Response:', JSON.stringify(data, null, 2), '\n');
        } else {
            console.log('✗ Gửi email chào mừng thất bại!');
            console.log('Error:', JSON.stringify(data, null, 2), '\n');
        }
    } catch (error) {
        console.log('✗ Lỗi:', error.message, '\n');
    }

    // 4. Gửi thông báo job mới
    console.log('4. Gửi thông báo job mới...');
    try {
        const response = await fetch(`${baseUrl}/mail/job-notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: emailAddress,
                subscriberName: 'Nguyễn Văn A',
                jobTitle: 'Senior NestJS Developer',
                jobCompany: 'ABC Technology Company',
                jobSalary: 50000000,
                jobSkills: ['JavaScript', 'TypeScript', 'NestJS', 'MongoDB', 'Docker'],
                jobId: '123456789'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✓ Gửi thông báo job thành công!');
            console.log('Response:', JSON.stringify(data, null, 2), '\n');
        } else {
            console.log('✗ Gửi thông báo job thất bại!');
            console.log('Error:', JSON.stringify(data, null, 2), '\n');
        }
    } catch (error) {
        console.log('✗ Lỗi:', error.message, '\n');
    }

    console.log('========================================');
    console.log('HOÀN THÀNH TEST!');
    console.log('========================================');
    console.log('\n💡 Lưu ý:');
    console.log('- Thay đổi emailAddress trong script thành email thật của bạn');
    console.log('- Đảm bảo đã cấu hình MAIL_USER và MAIL_PASS trong .env');
    console.log('- Kiểm tra spam folder nếu không thấy email');
}

// Chạy test
testMailService().catch(console.error);
