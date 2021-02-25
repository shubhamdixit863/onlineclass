const mongoose = require('mongoose');

const moment=require("moment");
// schema maps to a collection
const Schema = mongoose.Schema;

const classSchema = new Schema({
  name: String,
    startTime:Date,
    isLive:{type:Boolean,default:false},
    durationInHours:Number, // 
    classStarttime:{type:Date,default:null},
    classEndTime:{type:Date,default:null},

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

module.exports =class classRoomDb
{
    constructor(connectionString){
        this.connectionString = connectionString;
        this.classRoomObj = null; // no "Restaurant" object until "initialize" is complete
    }

    initialize(){
        return new Promise((resolve,reject)=>{
           let db = mongoose.createConnection(this.connectionString,{ useNewUrlParser: true,useUnifiedTopology: true });
           
            db.on('error', ()=>{
                reject();
            });
            db.once('open', ()=>{
                this.classRoomObj= db.model('class', classSchema);
                resolve();
            });
        });
    }
    
    // Method to update teacher's status ie active -->true or false
    async updateTeachersStatus(room,status,classStatus) // {room:"roomID",username:"username","role":"role"} // status -->[true ,false]
    {
        if(typeof classStatus==="undefined")
        {

            if(status)
            {
                // joining back no need to update the leaving time
                return await this.classRoomObj.updateOne({_id:room.room,"teachers.username":room.username},{$set:{"teachers.$.active":status}})

            }

            else{
                return await this.classRoomObj.updateOne({_id:room.room,"teachers.username":room.username},{$set:{"teachers.$.active":status,"teachers.$.leavingTime":moment().format("YYYY-MM-DD HH:mm:ss")}})

            }

        }

        else{
            console.log("Class Status",classStatus);
            return await this.classRoomObj.updateOne({_id:room.room,"teachers.username":room.username},{$set:{"teachers.$.leavingTime":moment().format("YYYY-MM-DD HH:mm:ss"),"teachers.$.active":status,isLive:classStatus}})
        }
    }

    // Method to update student's status ie active ->true or false

    async updateStudentStatus(room,status,all) // {room:"roomID",username:"username","role":"role"} // status -->[true ,false]
    {
       if(!all)
       {
          
           if(status)
           {
               // Its joining back no need to update the leaving time
            return await this.classRoomObj.updateOne({_id:room.room,"students.username":room.username},{$set:{"students.$.active":status}})

           }

           else{
            return await this.classRoomObj.updateOne({_id:room.room,"students.username":room.username},{$set:{"students.$.active":status,"students.$.leavingTime":moment().format("YYYY-MM-DD HH:mm:ss")}})

           }
          

       } 

       else{
        return await this.classRoomObj.updateMany({_id:room.room,"students.active":!status},{$set:{"students.$.leavingTime":moment().format("YYYY-MM-DD HH:mm:ss"),"students.$.active":status,classEndTime:moment().format("YYYY-MM-DD HH:mm:ss")}})
       }
    }

    // find class by id and teacher name

    async findClassByIdAndTeacherName(id,username)
    {
        let data=await this.classRoomObj.findOne({_id:id ,"teachers.username":username});
      
        if(data)
        {
            return true;
        }

        return false;
    }

    // insert document 

    async insertTeacherorStudent(room)
    {
        if(room.role==="Teacher")
        {
            await this.classRoomObj.updateOne({_id:room.room},{$set:{isLive:true,classStarttime:moment().format("YYYY-MM-DD HH:mm:ss")} ,$addToSet: { "teachers": { username:room.username,joiningTime:moment().format("YYYY-MM-DD HH:mm:ss") } }})
        }

        else{
          return  await this.classRoomObj.updateOne({_id:room.room},{$addToSet:{students:{ username:room.username,joiningTime:moment().format("YYYY-MM-DD HH:mm:ss") }}})
        }

    }

    // method to get all classes

    async getallClasses(live)
    {
        if(live)
        {
            let classes= await this.classRoomObj.find({isLive:live});
            return classes;
        }

        else{
            let classes= await this.classRoomObj.find();
            return classes;
        }
         
}

// Get class by id

async getClassById(id)
{
   return await this.classRoomObj.findOne({_id:id});
}

// check if class has teacher

async checkIfclassHasTEacher(id)
{
    let data=await this.classRoomObj.findOne({_id:id});
   
    if(data.teachers.length>0)
    {
        return true;
    }

    return false;
}

}

