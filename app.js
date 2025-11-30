const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Thư viện gọi HTTP
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS

// Lưu vị trí người dùng trong bộ nhớ
let users = {}; // key: username, value: {lat, lon}

// POST /location - nhận vị trí người dùng và cập nhật
app.post('/location', (req, res) => {
    const { lat, lon, username } = req.body;

    if (typeof lat !== 'number' || typeof lon !== 'number') {
        return res.status(400).json({ error: 'Invalid lat/lon' });
    }

    const name = username && username.trim() !== '' ? username.trim() : 'private user';

    // Kiểm tra người dùng mới
    if (!users[name]) {
        console.log(`Đã có người mới vào: ${name}`);
    } else {
        // Kiểm tra người dùng có thay đổi tên không
        const oldUsername = users[name].username;
        if (oldUsername !== name) {
            console.log(`Đổi tên từ "${oldUsername}" -> "${name}"`);
        }
    }

    // Cập nhật vị trí người dùng
    users[name] = { lat, lon, username: name };

    res.json({ status: 'ok' });
});

// GET /location - trả về tất cả vị trí
app.get('/location', (req, res) => {
    const allUsers = Object.keys(users).map(name => ({
        username: name,
        lat: users[name].lat,
        lon: users[name].lon
    }));
    res.json(allUsers);
});

// Đặt URL mặc định tại "/"
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Location Tracker API</h1>');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Vòng lặp gọi lại chính API mỗi 5 phút để duy trì server
    setInterval(async () => {
        try {
            // Gọi lại chính nó (đảm bảo server luôn hoạt động)
            await axios.get(`https://live-location-z40f.onrender.com`); // Thay thế với URL của bạn trên Render
            console.log("Ping to keep the server awake");
        } catch (error) {
            console.error("Error pinging server:", error);
        }
    }, 15000); 
});
