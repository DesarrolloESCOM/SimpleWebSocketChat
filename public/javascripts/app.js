$(document).ready(function(){
  // for testing purposes
  // Messages Namespace
  var messagesocket = io.connect('http://localhost:3000/messageNamespace');
  // Notification Namespace
  var notificationSocket = io.connect('http://localhost:3000/notificationNamespace');
  // Current user, generated randomly
  var currentUser = $("#idUser").val()||('AnonUser'+parseInt((271)*Math.random()));
  // Dialog stuff
  $("#dialog-form").dialog({
    autoOpen: false,
    height: 500,
    width: 500,
    modal: true,
    buttons: {
        "Subir": function() {
            $("#fileUploader").submit();
        },
        Cancel: function() {
            $(this).dialog("close");
        }
    },
    close: function() {
        getFileLog();
        return true;
    }
  });
  $("#openUploadDialog").button().click(function() {
    $("#dialog-form").dialog("open");
  });
  $("#fileUserName").val(currentUser);
  // send a new message to the chat
  function emitMessage(){
    var data = {};
    data.user = currentUser;
    data.content = $("#content").val()||'';
    data.date = new Date();
    $("#content").val('');
    messagesocket.emit('message',data);
  }
  // send a new private message 
  function emitPrivateMessage(){
    var data = {};
    data.user = currentUser;
    data.to = $("#to").val();
    data.content = $("#privateContent").val()||'';
    $("#content").val('');
    messagesocket.emit('privateMessage',data);
  }
  // Messages events
  messagesocket.on('connect',function connectedToSocket(){
    messagesocket.emit('register',{
      user:currentUser,
      socketId:messagesocket.id
    });
    messagesocket.emit('getLastChat',null);
  });

  messagesocket.on('syncMessages',function syncMessages(data){
    console.log(data);
    var len=data.length;
    for(var i=0; i < len;i++){
      $("#chatLog").append("<p><strong>"+data[i].user+":</strong> "+data[i].content+"</p>");
    }
    console.log(data);
  });

  messagesocket.on('incommingMessage', function incommingMessage(data){
    $("#chatLog").append("<p><strong>"+data.user+":</strong> "+data.content+"</p>");
  });
  messagesocket.on('receivePrivate', function receivePrivate(data){
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
  messagesocket.on('newFile', function newFileNotification(data){          
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