import React,{useState} from 'react'
import { ListGroup,Button,Col,Form} from 'react-bootstrap';
import axios from "axios";
import ReactJson from 'react-json-view'
const socketServer="http://104.237.2.69:5000";
function Admin() {
    const [id,setId]=useState("");
    const [classdata,setclassdata]=useState(null);


    let handLeChange=(e)=>{
        setId(e.target.value);

    }

    let sendinternalmessage=()=>{
        axios.get( `${socketServer}/api/class/${id}`).then(data=>{
            setclassdata(data["data"].data);
            setId("");
        })


    }
    return (
        <>
        <Col md={{ span: 4, offset: 1 }}>

<Form>
 
   

  <Form.Group controlId="formBasicPassword">
    <Form.Label>Class Id</Form.Label>
    <Form.Control type="text"  value={id} placeholder="Message" onChange={(e)=>handLeChange(e)} />
  </Form.Group>
  
  <Button variant="primary" type="button" onClick={sendinternalmessage}>
    Submit
  </Button>
</Form>
</Col>

<Col md={{ span: 5, offset: 1 }}>

    {classdata?<ReactJson src={classdata} />:""}
</Col>

</>
    )
}

export default Admin
