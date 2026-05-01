require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const User = require('./models/User');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const router = require('./routes/users');
    const app = express();
    app.use(express.json());
    app.use('/api/users', router);

    const server = app.listen(5001, async () => {
        console.log('Test server up');
        // We just want to see if the route matches
        // We'll use axios to make it easier
        const axios = require('axios');
        try {
            // Bypass middleware by modifying the router
            router.stack.forEach(layer => {
                if (layer.route) {
                    layer.route.stack = layer.route.stack.filter(s => s.name !== 'authMiddleware' && s.name !== 'adminMiddleware');
                }
            });
            
            const res = await axios.post('http://localhost:5001/api/users', { email: 'test_isolation@vantix.com' });
            console.log('STATUS:', res.status);
            console.log('DATA:', res.data);
        } catch (e) {
            console.log('ERROR:', e.response?.status, e.response?.data);
        }
        await mongoose.disconnect();
        server.close();
        process.exit(0);
    });
}
run();
