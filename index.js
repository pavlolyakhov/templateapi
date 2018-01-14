const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const router = require('./router');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const config = require('./config');

//DB setup

const ftr_users = config.dbConnectionString;// 'mongodb://pavl1:Mytestdb1@ds131546.mlab.com:31546/ftr_users';    //mongoose.connect('mongodb://localhost:27017/auth');
var promise = mongoose.connect(ftr_users, {
  useMongoClient : true
});

// App setup
app.use(morgan('combined'));
app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.json({type: '*/*'}));
//app.use(bodyParser.urlencoded({ extended: true }));
router(app);

//Server setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('server listening on:', port);
