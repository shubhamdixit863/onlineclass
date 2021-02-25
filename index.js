const express = require("express");
const socket = require("socket.io");
const cors=require("cors");
const service =require("./DB/service");
const db=new service('mongodb+srv://logan:1234@cluster0.x6qlj.mongodb.net/covid?retryWrites=true&w=majority');


// Application setup
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const server = app.listen(PORT, function () {
    db.initialize().then(()=>{
  
        console.log(`DB And Server Initilaized ,Server Listening on port ${PORT}`);
   
    }).catch((err)=>{
     console.log(err);
    });
 
});

let  io = socket(server, {
    cors: {
      origin: '*',
    }
  });




// Socket Setup // Allowing Remote connection From all domain



  io.sockets.on('connection', function(socket) {
   
      let room=socket.handshake.query;

      // IF the user disconnects due to the browser close and ,if the server still has the info then it can join back

      if(socket.adapter.rooms.has(room["room"]))
      {
          
           if(room.role==="Teacher")
          {
              db.updateTeachersStatus(room,true).then(data=>{
                socket.join(room["room"]);
                socket.id=`${room.username}_${room.role}_${room.room}`; // The username of the joined student is assigned to the socket id
                 socket.emit("message","Welcome Back to Class");
                 socket.to(room["room"]).emit("userjoin","Teacher joined Back"); // sending message only to particular rooms users

              })
             
          }

        
      }

  
    socket.on('create', function(room) {
      
        // MAking the class live as well 
        db.checkIfclassHasTEacher(room.room).then(data=>{
          // console.log("heyy 9999",data);
           if(data)
            {
                // Only Single Teacher is Allowed Per Class
                socket.emit("message","You Are Not Authorized To Join this Class As teacher");
            }

            else{
               db.insertTeacherorStudent(room).then(data=>{
                    // Creating the room once the class is live
                    socket.join(room.room);
                    socket.id=`${room.username}_${room.role}_${room.room}`;
                    socket.to(room["room"]).emit("message","Class Started");
                    socket.to(room["room"]).emit("userjoin","Teacher Joined the Class"); // sending message only to particular rooms users
                })

            }
        })
       
       
        
    });

    socket.on('join',function(room) {
        if(socket.adapter.rooms.has(room["room"]))
        {
            // The room has been created and the student can join the room now
           // console.log(socket.adapter.rooms.get(room["room"]).clients)
           
          
           // Checking if the coming user id is not in teachers list 
           // As if the user has joined as teacher ,he cant join as student
           db.findClassByIdAndTeacherName(room.room,room.username).then(data=>{
            // Data is null
            if(!data)
            {
                
                db.updateStudentStatus(room,true).then(result=>{

                  //  console.log("hey",result)
                    if(result.n===0)
                    {
    
                          // Updating the document and inserting the student only when its username doesnt exists
                         db.insertTeacherorStudent(room).then(data=>{
                            socket.join(room.room);
                            socket.id=`${room.username}_${room.role}_${room.room}`; // The username of the joined student is assigned to the socket id
                            socket.emit("message","You have Joined The Class"); // to particular socket
                            socket.to(room.room).emit("userjoin","New User Joined the Class"); // sending message only to particular rooms users
                        })
                    }

                    else{
                        socket.join(room.room);
                        socket.id=`${room.username}_${room.role}_${room.room}`; // The username of the joined student is assigned to the socket id
                        socket.emit("message","You have Joined The Class"); // to particular socket
                        socket.to(room.room).emit("userjoin","New User Joined the Class"); // sending message only to particular rooms users
                    }
    
    
                })
            }

            else{
                // The username belongs to teacher 

                socket.emit("errorjoining","Sorry ,You Can't Join As  Student"); // to particular socket

            }

           })
          

           
        
            
        }

        else{
            // The room does not exists yet ,so informing student that you can't join the class 
            socket.emit("errorjoining","This class is Not Started Yet"); 
         }
       })


       // Manual Disconnect ,When teacher disconnects from frontend

    socket.on("manualdisconnect",(room)=>{
           db.findClassByIdAndTeacherName(room.room,room.username).then(data=>{
           console.log("Heeyyyyy",data)
            if(data)
            {
                db.updateTeachersStatus(room,false,false).then(data=>{
                     // Updating All the student's leaving time 
                db.updateStudentStatus(room,false,true).then(data=>{
        
                        // Broadcasting event to all the sockets connected to room
                        socket.to(room["room"]).emit("endclass","You have been removed From The Room, Class Over"); // sending message only to particular rooms users
                           
                        socket.adapter.rooms.delete(room.room); // removing the room from socket adapter
                    }).catch(err=>{
                       
                    })

                })
               
            }

            else{
                // Only the teacher who started the class can end it
                socket.emit("message","You Are Not Authorized to End This Class");
            }
        })

       

    })

    socket.on("classMessage",(message)=>{
       // console.log(message);
        // For having message communication only in the particular class
        socket.to(message.room).emit("internalmessage",message.message); // sending message only to particular rooms users


    })

    socket.on("disconnect",()=>{

        // If some how user disconnects either closing the browser window or tab
        // then entry is made into db for the users
       // Socket id has all the information regarding the username
       // socket room id and the role
       let info=socket.id.split("_");
       ////console.log("Hii",socket.id);
     
       if(info.length==3)
       {
         if(info[1]==="Student")
         {
      
            db.updateStudentStatus({room:info[2],username:info[0],role:info[1]},false) .then(data=>{
              socket.to(info[2]).emit("userjoin","A Student Has Left the Class"); // sending message only to particular rooms users


            })
         }  

         else if(info[1]==="Teacher"){
             // If the teachers leaves the room then room will be destroyed and all the students will be removed from it

             db.updateTeachersStatus({room:info[2],username:info[0],role:info[1]},false).then(data=>{

                socket.to(info[2]).emit("message","Teacher Left the Room");
               // socket.adapter.rooms.delete(info[2]); // removing the room from socket adapter
            })
         }
     
     
       }
        

    })
   
});













// Api to get classes that are live

app.get("/api/liveClasses",async(req,res)=>{
    
    let data=await db.getallClasses(true);

    res.status(200).json({data});
})

// Apis to get List of Classes

app.get("/api/classes",async(req,res)=>{
    let classes=await db.getallClasses();

    res.status(200).json({data:classes})

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


// Api to get particular class by id

app.get("/api/class/:id",async(req,res)=>{

    let _class=await db.getClassById(req.params.id);

    res.status(200).json({data:_class})

})