const os = require('os');
var expect = require("chai").expect;
var socketio_client = require('socket.io-client');
const mongoose=require("mongoose");
const classDb=require("../DB/Class");

var end_point = 'http://' + os.hostname() + ':5000';
var opts = {forceNew: true};
let id;

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

before('connect', function(done){
  mongoose.connect('mongodb+srv://logan:1234@cluster0.x6qlj.mongodb.net/covid?retryWrites=true&w=majority').then(data=>{
    console.log("connected")

    done();
   
 
  })

})

describe('Add Class', function () {
  it('add class', function (done) {

    let newClass=new classDb({
      name:makeid(5),
      durationInHours:4,
    })
     
    newClass.save().then(data => {
     
          
        
          id=data._id;
         
          done()
      }).catch(err=>{
        console.log(err);
        done();
      })
  });

})


describe("async test with socket.io", function () {
this.timeout(10000);





it('Check Class Not Started Yet', function (done) {
    setTimeout(function () {
        var socket_client = socketio_client(end_point, opts);  

        socket_client.emit('join', {room:id,username:makeid(4),role:"Student"});

        socket_client.on('errorjoining', function (data) {
   
          expect(data).to.equal("This class is Not Started Yet")
        
            socket_client.disconnect();
            done();
        });

    
        }, 4000);
    });

    it('SuccessFully starts The class', function (done) {
      // This might fail if the class is already started
      // need to enter a mongodb query
      setTimeout(function () {
        
          var socket_client = socketio_client(end_point, opts);  
  
          socket_client.emit('create', {room:id,username:"logan",role:"Teacher"});
  
          socket_client.on('message', function (data) {
        
            expect(data).to.equal("Class Started")
         
              socket_client.disconnect();
              done();
          });
  
      
          }, 4000);
      });


      it('SuccessFully Joins The Class', function (done) {
        setTimeout(function () {
            var socket_client = socketio_client(end_point, opts);  
    
            socket_client.emit('join', {room:id,username:makeid(4),role:"Student"});
    
            socket_client.on('userjoin', function (data) {
            
              expect(data).to.equal("New User Joined the Class")
              
                socket_client.disconnect();
                done();// after every async operation done is required
            });
    
        
            }, 4000);
        });
});