import React from 'react'

import {Route,Redirect} from 'react-router-dom';

import auth from '../authentication/auth';

export default function UnProtectedroutes({component:Component,...rest}) {
    return (
       <Route
       {...rest}
       render={props=>{
           if(!auth.isAuthenticated())
           {
            return <Component {...props} />
           }
else{
    let role=auth.checkrole();
    if(role==="Teacher")
    {
        return(

      
            <Redirect
            to={{
                pathname:"/Teacher",
                state:{
                    from:props.location
                }
        
            }}
            
            />
    
        )

    }

    else{
        return(

      
            <Redirect
            to={{
                pathname:"/Student",
                state:{
                    from:props.location
                }
        
            }}
            
            />
    
        )
    }
  

  
   
}


        
       }}
       
       
       
       
       />
    )
}