require('./src/lib/system/config.js'),
    require('dotenv').config()
const express = require('express')
const path = require('path')
const CFonts = require('cfonts')
const bodyParser = require('body-parser')
const ip = require('request-ip')
const morgan = require('morgan')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const crypto = require('crypto')
const helmet = require('helmet')

const PORT = process.env.PORT || 3000

const run = async () => {
    mongoose.connect(`mongodb+srv://${process.env.MongoDbUser}:${process.env.MongoDbPassword}@serverdatadb.39fv13g.mongodb.net/nazi?retryWrites=true&w=majority&appName=ServerDataDB`)
        .catch(() => { process.exit() })
    const app = express()
    morgan.token('clientIp', (req) => req.clientIp)
    app.set('json spaces', 3)
        .set('view engine', 'ejs')
        .set('views', path.join(__dirname, 'views'))
        .set('trust proxy', true)
        .engine('ejs', require('ejs').__express)
        .use(helmet({
            contentSecurityPolicy: false, // Evita problemas con EJS y scripts en línea
            frameguard: { action: 'deny' }, // Evita que el sitio sea embebido en iframes
            xssFilter: true, // Protección contra XSS
            noSniff: true, // Evita que el navegador intente adivinar el tipo de archivo
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' } // Configura la política de referencia
        }))
        .use(express.json())
        .use((req, res, next) => {
            const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                             req.connection.remoteAddress || 
                             req.socket.remoteAddress || 
                             (req.connection.socket ? req.connection.socket.remoteAddress : null)
            
            console.log('Client IP:', clientIp)
            req.clientIp = clientIp
            next()
        })
        .use(ip.mw())
        .use(morgan(':clientIp :method :url :status :res[content-length] - :response-time ms'))
        .use(bodyParser.json({
            limit: '50mb'
        }))
        .use(bodyParser.urlencoded({
            limit: '50mb',
            extended: true,
            parameterLimit: 50000
        }))
        .use(express.static(path.join(__dirname, 'public')))
        .use(session({
            secret: crypto.randomBytes(64).toString('hex'),
            resave: false,
            saveUninitialized: true,
            store: MongoStore.create({
                mongoUrl: `mongodb+srv://${process.env.MongoDbUser}:${process.env.MongoDbPassword}@serverdatadb.39fv13g.mongodb.net/nazi?retryWrites=true&w=majority&appName=ServerDataDB`,
                collectionName: 'sessions'
            }),
            cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
        }))
        .use('/', await require('./src/handler.js'))
        .use((req, res, next) => {
            res.status(404).render("404")
        })

    app.disable('x-powered-by')
    app.use((req, res, next) => {
        res.setHeader('X-Powered-By', 'NXR-SERVER')
        next()
    })

    app.listen(PORT, () => {
        CFonts.say('Api Zioo', {
            font: 'tiny',
            align: 'center',
            colors: ['system']
        });
        CFonts.say(`Database is connected\nServer listening on port ---> ${PORT}`, {
            font: 'console',
            align: 'center',
            colors: ['system']
        })
    })
}

run().catch((err) => {
    console.error('Error al iniciar el servidor:', err)
    process.exit(1)
})