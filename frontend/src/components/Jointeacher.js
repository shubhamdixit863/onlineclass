import React,{useEffect,useState} from 'react'
import socketClient  from "socket.io-client";
import { ListGroup,Button,Col,Form} from 'react-bootstrap';
import auth from './authentication/auth';
import {useHistory,useLocation} from "react-router-dom";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import axios from "axios";
const socketServer="http://104.237.2.69:5000";


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }
function Jointeacher(props) {

    const [socketObj ,setSocketObj]=useState(null);
    const [selectedClass,setselectedClass]=useState(null);
    const [newUser,setNewUser]=useState("");
    const [inclassmessage,setInclassMessage]=useState("");
    const [open, setOpen] = React.useState(false);
    const [snackbarmessage,setsnackbarmessage]=useState("");
    let history=useHistory();



      const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setOpen(false);
      };
    
    let logout=()=>{
        localStorage.clear();
    
        history.push("/");
    
      }

    useEffect(() => {
        // initilaizing socket connection
        let userObj=JSON.parse(localStorage.getItem("userObj"));
        userObj.room=props.id;
        
        let socket= socketClient(`${socketServer}`,{query:userObj});

        if(socket)
        {
            setSocketObj(socket);  // Assigning it to state variable so that we can use it further
            socket.on('connect', () => {
                console.log(`I'm connected with the back-end`);
        });
    
    
        socket.on('disconnect', (s) =>
        console.log(`Disconnected: ${s.id}`));
        
        socket.on('message', (msg) => {
            setsnackbarmessage(msg);
            setOpen(true);
          
        });

        socket.on('internalmessage', (msg) => {
            setsnackbarmessage(msg);
            setOpen(true);
          
        });
        
        socket.on("userjoin",()=>{
            setNewUser(+ new Date());
        })
    
        socket.on('endclass', (msg) => {
          setsnackbarmessage(msg);
          setOpen(true);
            history.push("/Teacher");
           
        });
     
        }
        return () => {
            socket.disconnect();
    
      
        }
    }, [])


    useEffect(()=>{

        let _selectedclassId=props.id;
         let subscribe=true;
        if(_selectedclassId)
        {
            axios.get(`${socketServer}/api/class/${_selectedclassId}`).then(data=>{
               if(subscribe)
               {
                  if(data["data"].data.isActive)
                  {
                      history.push("/Teacher");
                      alert("You can't join running class as a teacher")
                  } 
                setselectedClass(data["data"].data);
               }
                
               
            }).catch(err=>{
                console.log(err);
            })
             
        }

        return ()=>{
            subscribe=false;
        }
    
    },[newUser])


    let startClass=()=>{
        // Emitting a socket event to create the room for this particular class
        let existingClass= props.id;
       
         let userObj=JSON.parse(localStorage.getItem("userObj"));
         socketObj.emit('create', {room:props.id,username:userObj.username,role:userObj.role});
         
         setNewUser(+ new Date());
     
       
     
     
     }
let handLeChange=(event)=>{
    setInclassMessage(event.target.value);

}
     let sendinternalmessage=()=>{
       if( inclassmessage.length>0)
       {
        socketObj.emit("classMessage",{room:props.id,message:inclassmessage})
        setInclassMessage("");
       }

         
     }
     
     let stopClass=(id)=>{
         let userObj=JSON.parse(localStorage.getItem("userObj"));
         userObj.room=props.id;
     
         socketObj.emit("manualdisconnect",userObj);
     
       
      
     
     }

    return (
        <>

<Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {snackbarmessage}
        </Alert>
      </Snackbar>
         <Col md={{ span: 1, offset: 0 }}>

        {auth.isAuthenticated()?<Button variant="outline-primary" onClick={logout}>Logout</Button>:""}

        </Col>

        <Col  md={{ span: 4, offset: 0 }}>
 
            <Button  style={{marginLeft:"20px"}}   variant="outline-danger"> {props.name}</Button> 

        <Button  style={{marginLeft:"20px"}}  onClick={()=>startClass()} variant="outline-info"> Start</Button> 
        <Button  style={{marginLeft:"20px"}}  onClick={()=>stopClass()} variant="outline-info"> Stop</Button> 
        </Col>
            <Col md={{ span: 2, offset: 0 }}>

            <h4>Student</h4><br></br>

{selectedClass?<ListGroup>
    {selectedClass.students.map((ele,i)=>{
       
            if(ele.active)
            {
              return  <ListGroup.Item key={i}>
     <h6>{ele.username} </h6>  <img src="https://img.icons8.com/emoji/20/000000/green-circle-emoji.png"/>

            </ListGroup.Item>
            }
            else{
               return <ListGroup.Item key={i}>
                   <h6>{ele.username} </h6>   <img src="https://img.icons8.com/material-sharp/20/000000/error-cloud.png"/>
               </ListGroup.Item>
            }
           

   


        })}



</ListGroup>:""}

</Col>

<Col md={{ span: 2, offset: 0 }}>

<h4>Teacher</h4><br></br>
{selectedClass?<ListGroup>
    {selectedClass.teachers.map((ele,i)=>{
       
            if(ele.active)
            {
              return  <ListGroup.Item key={i}>
     <h6>{ele.username} </h6>  <img src="https://img.icons8.com/emoji/20/000000/green-circle-emoji.png"/>

            </ListGroup.Item>
            }
            else{
               return <ListGroup.Item key={i}>
                   <h6>{ele.username} </h6>   <img src="https://img.icons8.com/material-sharp/20/000000/error-cloud.png"/>
               </ListGroup.Item>
            }
           

   


        })}



</ListGroup>:""}

</Col>

<Col md={{ span: 2, offset: 1 }}>

<Form>
 
   

  <Form.Group controlId="formBasicPassword">
    <Form.Label>Message</Form.Label>
    <Form.Control type="text"  value={inclassmessage} placeholder="Message" onChange={(e)=>handLeChange(e)} />
  </Form.Group>
  
  <Button variant="primary" type="button" onClick={sendinternalmessage}>
    Submit
  </Button>
</Form>
</Col>
        </>
    )
}

export default Jointeacher
