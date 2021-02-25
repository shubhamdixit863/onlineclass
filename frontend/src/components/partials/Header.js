import React from 'react';
import auth from '../authentication/auth';
import { Navbar,Nav } from 'react-bootstrap';
import {Link} from "react-router-dom";
function Header() {
    return (
        <Navbar bg="light" expand="lg">
  <Navbar.Brand href="/">Online Class Room</Navbar.Brand>
  <Navbar.Toggle aria-controls="basic-navbar-nav" />
  <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto">

      
      <Link to="/admin">Admin</Link>
    
     
    </Nav>
 
  </Navbar.Collapse>
</Navbar>
    )
}

export default Header
