


class Auth
{

constructor()
{
    this.authenticated=false;
}




isAuthenticated()
{

let token=localStorage.getItem("userObj");

if(!token)
{


    return false;
}
else{

  

      return true;
}


}

checkrole()
{

    let token=JSON.parse(localStorage.getItem("userObj"));

    return token.role;
   
}



}

export default new Auth();