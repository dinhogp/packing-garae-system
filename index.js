const express = require('express');
const app = express();

require('./startup/db')();
require('./startup/validation')();
require('./startup/config')();

const port = process.env.PORT || 3000;

app.get('/',(req, res)=>{
    return res.status(200).send('<h1>Hello from the other side</h1>');
});

const server = app.listen(port,()=>{console.log(`listening on port - ${port}`);});

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", " Content-Type");
    res.header("Access-Control-Allow-Methods", 'GET, POST,PUT');
    next();
});

module.exports = server;