const mongoose = require('mongoose');
// schema maps to a collection
const Schema = mongoose.Schema;

const classSchema = new Schema({
  name: String,
    startTime:Date,
    isLive:{type:Boolean,default:false},
    durationInHours:Number, // 

    teachers:[
        {
            "username":String,
            "joiningTime":Date,
            "leavingTime":{type:Date ,default:null},
            "active":{type:Boolean,default:true}
        }
    ],
    students:[
        {
            "username":String,
            "joiningTime":Date,
            "leavingTime":{type:Date ,default:null},
            "active":{type:Boolean,default:true}
        }
    ]
 
});

module.exports = mongoose.model('class', classSchema)