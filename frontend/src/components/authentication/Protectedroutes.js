import React from 'react'

import {Route,Redirect} from 'react-router-dom';

import auth from '../authentication/auth';

export default function Protectedroutes({component:Component,...rest}) {
    return (
       <Route
       {...rest}
       render={props=>{
           let loc=props.location.pathname.split("/");
           console.log(loc)
           if(auth.isAuthenticated() && auth.checkrole()===loc[1])
           {
            return <Component {...props} />
           }
else{
    return(
        <Redirect
        to={{
            pathname:"/",
            state:{
                from:props.location
            }
    
        }}
        
        />

    )

  
   
}


        
       }}
       
       
       
       
       />
    )
}