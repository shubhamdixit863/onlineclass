import React,{useEffect,useState} from 'react';
import {useLocation} from "react-router-dom";
import socketClient  from "socket.io-client";

import { ListGroup,Button,Col} from 'react-bootstrap';
import auth from './authentication/auth';
import {useHistory} from "react-router-dom";
const socketServer="http://localhost:5000";
function Student() {
    let history=useHistory();
    const [liveClasses,setLiveClasses]=useState([]);
  



    let logout=()=>{
        localStorage.clear();
    
        history.push("/");
    
      }


   

    useEffect(() => {

        // Loading All the live classes
      
        fetch(`${socketServer}/api/liveClasses`).then(res=>res.json()).then(data=>{
            setLiveClasses(data["data"]);

        })
       
    }, [])



let joinClass=(id,name)=>{

    history.push(`/Student/join/${name}/${id}`);
  }

    return (
        <>
<div>
        {auth.isAuthenticated()?<Button variant="outline-primary" onClick={logout}>Logout</Button>:""}

        </div>
         <Col md={{ span: 3, offset: 0 }}>
         <ListGroup>
             {
                liveClasses.map(ele=>(
               <ListGroup.Item key={ele._id}> {ele.name } <Button onClick={()=>joinClass(ele._id,ele.name)} variant="outline-info"> Join</Button></ListGroup.Item>
                ))
             }
             </ListGroup>
</Col>



        </>
    )
}

export default Student
