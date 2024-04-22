const express = require('express')
const morgan = require('morgan')

const cookieParser = require('cookie-parser')
const cors = require('cors')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const path = require('path')
const globalErrorHandler = require('./controllers/errorController')

const AppError = require('./utils/AppError')

const articleRouter = require('./routes/articleRoutes')
const userRouter = require('./routes/userRoutes')
const stockRouter = require('./routes/stockRoutes') 
const bookRouter = require('./routes/bookRoutes')

const app = express(); 

app.use(cors({
    credentials: true, 
    origin: 'https://localhost:5173'
})) 

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json())


// -> Middleware to sanitize the incoming data and prevent NoSQL Injections (removes $ from the body as in MongoDB, operators have $ as prefix.)
app.use(mongoSanitize())


// -> Middleware to prevent XSS Attacks, injecting JS code with some HTML code into incoming data, this middleware cleans it.
app.use(xss())



app.use(cookieParser())
 

app.use('/api/v1/articles', articleRouter) 
app.use('/api/v1/users', userRouter)
app.use('/api/v1/stocks', stockRouter) 
app.use('/api/v1/books',bookRouter)
app.use('/images', express.static( path.join(__dirname, 'public', 'articleImages') ) )


app.all('*', (req, res, next) => {
    next( new AppError(`Can't find ${req.originalUrl} ! Please try a different route.`, 404) )
})

app.use(globalErrorHandler)
module.exports = app;