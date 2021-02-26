import React,{useEffect,useState} from 'react'
import socketClient  from "socket.io-client";
import { ListGroup,Button,Col,Form} from 'react-bootstrap';
import auth from './authentication/auth';
import {useHistory,useLocation} from "react-router-dom";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
const socketServer="http://104.237.2.69:5000";


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }
function Joinstudent(props) {

    const [socketObj ,setSocketObj]=useState(null);
    const [selectedClass,setselectedClass]=useState(null);
    const [newUser,setNewUser]=useState("");
    const [open, setOpen] = React.useState(false);
    const [snackbarmessage,setsnackbarmessage]=useState("");
    const [inclassmessage,setInclassMessage]=useState("");
    let history=useHistory();


    let handLeChange=(event)=>{
        setInclassMessage(event.target.value);
    
    }
         let sendinternalmessage=()=>{
           if( inclassmessage.length>0)
           {
          
            socketObj.emit("classMessage",{room:props.id,message:inclassmessage});
            setInclassMessage("");
           }
    
             
         }

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


      useEffect(()=>{

        let _selectedclassId=props.id;
        let isSubscribed = true;
        if(_selectedclassId)
        {
            axios.get(`${socketServer}/api/class/${_selectedclassId}`).then(data=>{
               if(isSubscribed)
               {
                setselectedClass(data["data"].data);
               }
               
               
            }).catch(err=>{
                console.log(err);
            })
             
        }

        return()=>{
            isSubscribed=false;  // Cleanup function to prevent memory leaks
        }
    
    },[newUser])

      useEffect(() => {
      
        let userObj=JSON.parse(localStorage.getItem("userObj"));
        let socket= socketClient(`${socketServer}`,{query:userObj});
        socket.emit("join",{room:props.id,username:userObj.username,role:userObj.role});
        setNewUser(+ new Date());
      
         if(socket)
        {
            setSocketObj(socket);  // Assigning it to state variable so that we can use it further
            socket.on('connect', () => {
                console.log(`I'm connected with the back-end`);
        });
    
    
        socket.on('disconnect', (s) =>
        console.log(`Disconnected: ${s.id}`));
        
        socket.on('message', (msg) => {
          setNewUser(+ new Date());
            setsnackbarmessage(msg);
            setOpen(true);

        });

        socket.on('errorjoining', (msg) => {
            alert(msg);
            history.push("/Student")
          });
        

          socket.on('internalmessage', (msg) => {
            setsnackbarmessage(msg);
            setOpen(true);
          
        });
        socket.on("userjoin",(message)=>{
            setsnackbarmessage(message);
            setOpen(true);
            setNewUser(+ new Date());
        })
    
        socket.on('endclass', (msg) => {
            history.push("/Teacher")
            alert(msg);
        });
     
        }
       
    }, [])
    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {snackbarmessage}
        </Alert>
      </Snackbar>
            <Col md={{ span: 3, offset: 1 }}>
                <h4>Students</h4><br></br>

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

<Col md={{ span: 3, offset: 1 }}>
   
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

<Col md={{ span: 3, offset: 1 }}>

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

export default Joinstudent
