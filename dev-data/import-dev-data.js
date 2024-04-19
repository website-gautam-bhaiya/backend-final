 
const dotenv = require('dotenv')
const mongoose = require('mongoose') 
const Article = require('./../models/articleModel')
const news = require('./data')


dotenv.config( { path: './config.env' } )


const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)

mongoose.connect( DB, {
    useNewUrlParser: true

}).then( () => console.log("DB Connection Successful!"))


const importData = async () => {
    
    try {

        await Article.create(news);
        console.log('Data Created Successfully!');
    }
    
    catch (err) {
        console.log(err);
    }
    process.exit();
}

const deleteData = async () => {
    
    try {

        await Article.deleteMany()
        console.log('Data Deleted Successfully!');
    }
    catch (err) {
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] === '--import') {

    importData();
}
else if(process.argv[2] === '--delete') {

    deleteData();
}
