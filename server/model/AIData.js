const mongoose = require("mongoose")

const AIDataSchema =new mongoose.Schema( {
    name: String ,
    email: String,
    mobile: Number,
    password: String
    

})

const AIDataModel= mongoose.model("AIData" , AIDataSchema)
module.exports = AIDataModel