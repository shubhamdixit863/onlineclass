import React,{useEffect,useState} from 'react';
import {useLocation} from "react-router-dom";
import socketClient  from "socket.io-client";
import axios from "axios";

import { ListGroup,Button,Col} from 'react-bootstrap';
import auth from './authentication/auth';
import {useHistory} from "react-router-dom";
const socketServer="http://104.237.2.69:5000";
function Student() {
    let history=useHistory();
    const [liveClasses,setLiveClasses]=useState([]);
  



    let logout=()=>{
        localStorage.clear();
    
        history.push("/");
    
      }


   

    useEffect(() => {

        // Loading All the live classes
      
        axios.get(`${socketServer}/api/liveClasses`).then(data=>{
            setLiveClasses(data["data"].data);

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
