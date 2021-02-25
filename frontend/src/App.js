import logo from './logo.svg';
import './App.css';
import { Col,Row,Container } from 'react-bootstrap';

import Header from './components/partials/Header';
import Login from './components/Login';
import {Switch,Route} from "react-router-dom";
import Teacher from './components/Teacher';
import Student from './components/Student';
import Protectedroutes from './components/authentication/Protectedroutes';

import UnProtectedroutes from './components/authentication/UnProtectedroutes';
import Admin from './components/Admin';
import Jointeacher from './components/Jointeacher';
import Joinstudent from './components/Joinstudent';
function App() {
  return (
   <>
<Header/>

<Container >
  <Row style={{marginTop:"180px"}}>
   
    
    <Switch>
    <Protectedroutes exact path="/Teacher" component={(props)=><Teacher {...props}/>}  />


    <Protectedroutes exact path="/Teacher/join/:name/:id" component={(props)=><Jointeacher id={props.match.params.id}  name={props.match.params.name}/>}  />

    <Protectedroutes exact path="/Student/join/:name/:id" component={(props)=><Joinstudent id={props.match.params.id}  name={props.match.params.name}/>}  />

          <Protectedroutes exact path="/Student" component={(props)=><Student {...props}/>}  />
         
        

          <UnProtectedroutes exact path="/"  component={() => <Login/>} />

          <Route exact path="/"  component={() => <Admin/>} />
        </Switch>
    
  </Row>
</Container>

   </>
  );
}

export default App;
