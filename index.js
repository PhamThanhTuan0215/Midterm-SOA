const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('express-flash')
require('dotenv').config()

const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')

const file  = fs.readFileSync('./api-docs.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

const app = express()

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

const connections = require('./notification/connections')
// Nhận kết nối đầu bếp từ client
app.get('/notification/chef', (req, res) => {
    // Thiết lập kết nối SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    connections.pushChefConnection(res);

    req.on('close', () => {
        connections.removeChefConnection(res)
    });
});

// Nhận kết nối khách hàng từ client
app.get('/notification/customer', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    connections.pushCustomerConnection(res);

    req.on('close', () => {
        connections.removeCustomerConnection(res)
    });
});

app.use('/customer', require('./routers/Customer'))
app.use('/waiter-manager', require('./routers/Waiter_Manager'))
app.use('/chef', require('./routers/Chef'))

app.use((req, res) => {
    res.redirect('/')
})

const PORT = process.env.PORT || 3000
const LINK_WEBSITE = process.env.LINK_WEBSITE || 'http://localhost:' + PORT
const {MONGODB_URI, DB_NAME} = process.env
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: DB_NAME
})
.then(() => {
    app.listen(PORT, () => {
        console.log(LINK_WEBSITE)
    })
})
.catch(e => console.log('Can not connect db server: ' + e.message))