var os = require('os');
var expect = require("chai").expect;
var socketio_client = require('socket.io-client');

var end_point = 'http://' + os.hostname() + ':5000';
var opts = {forceNew: true};

describe("async test with socket.io", function () {
this.timeout(10000);

it('Check Class Not Started Yet', function (done) {
    setTimeout(function () {
        var socket_client = socketio_client(end_point, opts);  

        socket_client.emit('join', {room:"89908qweee",username:"logan",role:"Student"});

        socket_client.on('errorjoining', function (data) {
          console.log(data);
          expect(data).to.equal("This class is Not Started Yet")
           // data.should.be.an('string');
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
  
          socket_client.emit('create', {room:"603510165b8bd42cf55ce8aa",username:"logan",role:"Teacher"});
  
          socket_client.on('message', function (data) {
            console.log(data);
            expect(data).to.equal("Class Started")
         
              socket_client.disconnect();
              done();
          });
  
      
          }, 4000);
      });
});