const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const https = require('https');
const app = require('./app');

dotenv.config({ path: ".env" });

// SSL options (uncomment if using HTTPS)
const options = {};
try {
    options.key = fs.readFileSync(path.join(__dirname, 'ssl--certificates/decrypted-key.pem'));
    options.cert = fs.readFileSync(path.join(__dirname, 'ssl--certificates/cert.pem'));
} catch (err) {
    console.error("SSL Certificate Error:", err.message);
    process.exit(1);
}

// MongoDB connection
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
const connectWithRetry = async () => {
    try {
        await mongoose.connect(DB, { useNewUrlParser: true });
        console.log("DB Connection Successful!");
    } catch (err) {
        console.error("MongoDB connection failed. Retrying in 5 seconds...");
        setTimeout(connectWithRetry, 5000);
    }
};
connectWithRetry();

// Server setup
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const server = isProduction
    ? https.createServer(options, app).listen(port, () => console.log(`App running on HTTPS PORT:${port}...`))
    : app.listen(port, () => console.log(`App running on HTTP PORT:${port}...`));

process.on('unhandledRejection', err => {
    console.error("Unhandled Rejection:", err);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;
