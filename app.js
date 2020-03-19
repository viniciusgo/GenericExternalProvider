var express = require('express')
var path = require('path');
var cors = require('cors')
var cookieParser = require('cookie-parser')

var routes = require('./routes/routes')

var app = express();
app.use(cookieParser());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/payments', routes);

//routes(app);

app.listen(8080);