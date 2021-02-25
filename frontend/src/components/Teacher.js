import React,{useEffect,useState} from 'react'
import socketClient  from "socket.io-client";
import { ListGroup,Button,Col} from 'react-bootstrap';
import auth from './authentication/auth';
import {useHistory,useLocation} from "react-router-dom";
import queryString from 'query-string';
const socketServer="http://localhost:5000";

function Teacher() {
    let history=useHistory();
    let location=useLocation();
    console.log("Hi",location)
    const [classes,setClasses]=useState([]);

    let {message}  = queryString.parse(useLocation().search);
  
   let joinClass=(id,name)=>{
    history.push(`/Teacher/join/${name}/${id}`);
   }

    let logout=()=>{
        localStorage.clear();
    
        history.push("/");
    
      }
  

useEffect(()=>{
   

    // fetching all the classes in the db
    fetch(`${socketServer}/api/classes`).then(res=>res.json()).then(data=>{
        setClasses(data["data"]);
        
    }).catch(err=>{
        console.log(err);
    })

},[])










    
    return (
        <>
        <Col md={{ span: 1, offset: 0 }}>
        {auth.isAuthenticated()?<Button variant="outline-primary" onClick={logout}>Logout</Button>:""}

        </Col>
         <Col md={{ span: 4, offset: 1 }}>
         <ListGroup>
             {
                 classes.map(ele=>(
               <ListGroup.Item key={ele._id}> {ele.name } <Button onClick={()=>joinClass(ele._id,ele.name)} style={{marginLeft:"20px"}} variant="outline-info"> Join</Button> </ListGroup.Item>
                ))
             }
             </ListGroup>
</Col>


        </>
       
    )
}

export default Teacher
