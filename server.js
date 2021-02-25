const express = require("express");
const socket = require("socket.io");
const classDB = require("./models/Class");
const cors=require("cors");
const mongoose=require("mongoose");
const moment=require("moment");


// MongoDb Connection
mongoose.connect('mongodb+srv://logan:1234@cluster0.x6qlj.mongodb.net/covid?retryWrites=true&w=majority', {useNewUrlParser: true}).then(data=>{
    console.log("Connected");
}).catch(Err=>{
    console.log(Err);
})

// Application setup
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  
});


// Socket Setup // Allowing Remote connection From all domain

const io = socket(server, {
    cors: {
      origin: '*',
    }
  });


function createSocketNameSpace(classname,classduration,teachername,callback)
{
    // All Required Class Logic Will go Here

    const namespace = io.of(classname);
    console.log(namespace.name);

namespace.on('connection', function(socket) {
    
  const _namespace = socket.nsp;
 
  console.log("A  Student Has Been Connected to the Class")

  socket.emit('message', `Successfully connected on namespace: ${_namespace.name}`);

 

  socket.on('message', function(data) {
    console.log('A message was received from a client: ', data);
    socket.broadcast.emit('message', data);
  });

  
  
})

namespace.on("disconnect",()=>{
    console.log("NameSpace Deleted");
})

 // Updating the mongodb document with the flag live true
 classDB.updateOne({_id:classname},{$set:{isLive:true} ,$addToSet: { "teachers": { username:teachername,joiningTime:moment().format("YYYY-MM-DD HH:mm:ss") } } }).then(data=>{
      callback("Success");

  })

    // Here a SetTimeout Listener with the  update task for updating will be set
    // So that class will be expired after the duration automatically
    // Also the namespace is destroyed automatically from the socket
    let duration=3600000*classduration
    console.log(duration);
    setTimeout(()=>{
        console.log("uppp");
         // Updating the mongodb document with the flag live true
 classDB.updateOne({_id:classname},{$set:{isLive:false}}).then(data=>{
    // Removing the Name Space Here As Well 
    // Once The  Duration Of Class is Over 
    // this will free the memory 

    const connectedNameSpaceSockets = Object.keys(namespace.connected); // Get Object with Connected SocketIds as properties
    connectedNameSpaceSockets.forEach(socketId => {
    namespace.connected[socketId].disconnect(); // Disconnect Each socket
});
namespace.removeAllListeners(); // Remove all Listeners for the event emitter
delete io.nsps[`${namespace}`]; // Remove from the server namespaces

})

    },duration)
  

}

// Function To Delete the  namespace and make the class go unlive


function DeleteNameSpace(name)
{  
    const namespace=io.of(`/${name}`);
    namespace.sockets.forEach(socketId => {
   socketId.disconnect();
});
namespace.removeAllListeners(); // Remove all Listeners for the event emitter
//delete io.nsps[`/${namespace}`]; // Remove from the server namespaces




}




// api to create namespace for particular class

app.post("/api/createClassNameSpace",(req,res)=>{
    console.log(req.body)

    let name=req.body.id;
    createSocketNameSpace(name,1,"logan",(data)=>{
        console.log("hello");
        res.status(200).json({message:data});

    })


})

// Api to get classes that are live

app.get("/api/liveClasses",async(req,res)=>{
    
    let data=await classDB.find({isLive:true});

    res.status(200).json({data});
})

// Apis to get List of Classes

app.get("/api/classes",async(req,res)=>{

    try {
       let classes= await classDB.find();
       res.status(200).json({data:classes})
        
    } catch (error) {
        // Logging the error
        res.status(400).send();
    }

})

// Api To Create Classes

app.post("/api/create",async(req,res)=>{
    try {
        let classDoc= await classDB.create(req.body)
        res.status(200).json({data:classDoc})
         
     } catch (error) {
         // Logging the error
         res.status(400).send();
     }

})


// Api to Delete Classes and make them unlive
app.post("/api/deleteClass",async(req,res)=>{
    await classDB.updateOne({_id:req.body.id},{$set:{isLive:false}});
    DeleteNameSpace(req.body.id);

    res.status(200).json({message:"Class Deleted SuccessFully"});
    

})