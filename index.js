const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('express-flash')
require('dotenv').config()

const app = express()

app.use(cookieParser('ptt_nmtt_tnp'));
app.use(session({ cookie: { maxAge: 12000000 } })); //2h
app.use(flash());

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('Home')
})

app.use('/customer', require('./routers/Customer'))
app.use('/waiter-manager', require('./routers/Waiter_Manager'))
app.use('/chef', require('./routers/Chef'))

app.use((req, res) => {
    res.redirect('/')
})

const PORT = process.env.PORT || 3000
const LINK_WEB = process.env.LINK_WEB || 'http://localhost:' + PORT
const {MONGODB_URI, DB_NAME} = process.env
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: DB_NAME
})
.then(() => {
    app.listen(PORT, () => {
        console.log(LINK_WEB)
    })
})
.catch(e => console.log('Can not connect db server: ' + e.message))