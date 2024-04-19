
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const app = require('./app') 

dotenv.config( { path: ".env" } )


const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    
}).then( conn => console.log("DB Connection Successful!"))

const port = process.env.PORT || 3000;  
const server = app.listen(port,  () => console.log(`App running on PORT:${port}...`))

process.on('unhandledRejection', err => {
    
    console.log(err.name, err.message);
    server.close( () => {
        process.exit(1)
    })    
})
