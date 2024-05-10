const express = require('express');
const morgan = require("morgan");
const cors = require("cors");
const errorhandler = require('errorhandler');
const mongoose = require('mongoose');

const config = require("./config")

const isProduction = config.stage == "production";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('combined'));
app.use(cors());
app.disable('etag');

mongoose.connect(`mongodb://${config.mongo_host}:${config.mongo_port}/${config.mongo_db}`)

mongoose.connection.on('open',()=>{
  console.log("Connection OK");
});

mongoose.connection.on('error',(err)=>{
  console.log("Connection Fail",err);
});

app.use('/api', require('./routes'));
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (!isProduction) {
  app.use(errorhandler())
}

/// error handlers
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json(
    {
      "error":{
        message: err.message
      }
    });
});

app.listen(config.port, () => {
  console.log('IoTAgent UI BFF started on port: ' + config.port)
});