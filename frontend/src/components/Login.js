import React,{useState} from 'react'
import { InputGroup,FormControl,DropdownButton,Col ,Dropdown} from 'react-bootstrap';
import {useHistory} from "react-router-dom";
function Login() {

    const [state,setState] =useState({
        username:"",
        role:"Select Role"
    });

    let history=useHistory();

    let handleChange=(event)=>{
       
     setState({...state,role:event})

    }

    let handleInputchange=(event)=>{
        setState({...state,[event.target.name]:event.target.value})

    }
    // Entering the student room or the teacher room
    let enterRoom=()=>{
        if(state.username.length>0 && state.role!="Select Role")
        {
           localStorage.setItem("userObj",JSON.stringify({role:state.role,username:state.username}))
            history.push(`/${state.role}`)
        }
       
      
    }
    return (
        <Col md={{ span: 6, offset: 3 }}>
              <InputGroup>
    <FormControl
      placeholder="Your username"
      aria-label="Your username"
      aria-describedby="basic-addon2"
      onChange={(e)=>handleInputchange(e)}
      value={state.username}
      name="username"
    />

    <DropdownButton
     onSelect={(e)=>handleChange(e)}
      as={InputGroup.Append}
      variant="outline-secondary"
      title={state.role}
      id="input-group-dropdown-2"
      onClick={enterRoom}
    >
      
      <Dropdown.Item eventKey="Teacher" >I am a Teacher</Dropdown.Item>
      <Dropdown.Item eventKey="Student">I am a Student</Dropdown.Item>
      <Dropdown.Divider />
   
    </DropdownButton>
  </InputGroup>
   
        </Col>
    )
}

export default Login
