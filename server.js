
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const fs = require('fs')
const app = require('./app') 
const https = require('https')
dotenv.config( { path: ".env" } )

// const options = {
//     key: fs.readFileSync('./../ssl--certificates/decrypted-key.pem'),
//     cert: fs.readFileSync('./../ssl--certificates/cert.pem')
// };


const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    
}).then( conn => console.log("DB Connection Successful!"))

const port = process.env.PORT || 3000;  
// const server = https.createServer(options, app).listen(port,  () => console.log(`App running on PORT:${port}...`))

const server = app.listen(port, () => console.log(`App running on PORT:${port}...`))

process.on('unhandledRejection', err => {
    
    console.log(err.name, err.message);
    server.close( () => {
        process.exit(1)
    })    
})
