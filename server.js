const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const app = require('./app');
const https = require('https');
dotenv.config({ path: ".env" });

// SSL options (uncomment if using HTTPS)
const path = require('path');
const options = {
    key: fs.readFileSync(path.join(__dirname, 'ssl--certificates/decrypted-key.pem')),
    cert: fs.readFileSync('ssl--certificates/cert.pem')
};

// MongoDB connection
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    // Removed useNewUrlParser, no longer needed
}).then(conn => console.log("DB Connection Successful!"));

// Server setup (choose either HTTP or HTTPS)
const port = process.env.PORT || 3000;
//const server = app.listen(port, () => console.log(`App running on PORT:${port}...`));
// If using HTTPS, uncomment below and comment the HTTP line
const server = https.createServer(options, app).listen(port, () => console.log(`App running on PORT:${port}...`));

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;
