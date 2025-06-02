const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () =>{
    
     mongoose.connect(process.env.CONNSTR).then(()=>{
        console.log("connection to database successful")
     }).catch(err => console.log(err));
}

module.exports = connectDB