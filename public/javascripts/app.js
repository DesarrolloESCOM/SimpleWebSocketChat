$(document).ready(function(){
  // for testing purposes
  // Messages Namespace
  var messagessocket = io.connect('http://localhost:3000/messageNamespace');
  // Notification Namespace
  var notificationSocket = io.connect('http://localhost:3000/notificationNamespace');
  // Current user, generated randomly
  var currentUser = $("#idUser").val()||('AnonUser'+parseInt((171)*Math.random()));
  // send a new message to the chat
  function emitMessage(){
    var data = {};
    data.user = currentUser;
    data.content = $("#content").val()||'';
    data.date = new Date();
    $("#content").val('');
    messagessocket.emit('message',data);
  }
  // send a new private message 
  function emitPrivateMessage(){
    var data = {};
    data.user = currentUser;
    data.to = $("#to").val();
    data.content = $("#privateContent").val()||'';
    $("#content").val('');
    messagessocket.emit('privateMessage',data);
  }
  // Messages events
  messagessocket.on('connect',function connectedToSocket(){
    messagessocket.emit('register',{
      user:currentUser,
      socketId:messagessocket.id
    });
    messagessocket.emit('getLastChat',null);
  });

  messagessocket.on('syncMessages',function syncMessages(data){
    console.log(data);
    var len=data.length;
    for(var i=0; i < len;i++){
      $("#chatLog").append("<p><strong>"+data[i].user+":</strong> "+data[i].content+"</p>");
    }
    console.log(data);
  });

  messagessocket.on('incommingMessage', function incommingMessage(data){
    $("#chatLog").append("<p><strong>"+data.user+":</strong> "+data.content+"</p>");
  });
  messagessocket.on('receivePrivate', function receivePrivate(data){
      $("#chatLog").append("<p><strong>[PRIVATE]-"+data.user+":</strong> "+data.content+"</p>");
    });
  // notifications Event
  notificationSocket.on('connect',function connectedToNotifications(){
    notificationSocket.emit('getUserList'); 
  });
  notificationSocket.on('refreshUserList',function refreshUserListNotification(data){
    $("#users").html("");
    console.log(data);
    for(var key in data){
      if(data.hasOwnProperty(key)){
        $("#users").append("<li>"+key+"</li>");
      }
    }
  });
  // Files events
  messagessocket.on('newFile', function newFileNotification(data){          
    if((currentUser!=data.user)){
      board.saveShape(LC.JSONToShape(data.images));
    }
  });

  //Chat Stuff
  $(document).on("click",'#sendMessage', emitMessage);    
  $(document).on("click",'#sendPrivate', emitPrivateMessage);    
  $(document).on("keyup",'#content', function onKeyUpEvent(e) {
    if (e.keyCode == 13) {
      emitMessage();
    }
  });
  $(document).on('click','#users > li',function getValue(){
    console.log($(this).text());
    $("#to").val($(this).text());
  });
});