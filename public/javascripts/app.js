$(document).ready(function(){
  // for testing purposes
  // Messages Namespace
  var messagesocket = io.connect('/messageNamespace');
  // Notification Namespace
  var notificationSocket = io.connect('/notificationNamespace');
  // Current user, generated randomly
  window.currentUser = $("#idUser").val()||('AnonUser'+parseInt((271)*Math.random()));
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
      "Cancelar": function() {
          $(this).dialog("close");
      }
    },
    close: function() {      
      return true;
    },
    open: function(){
      $("#fileUserName").val(window.currentUser);
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
    var len=data.length;
    for(var i=0; i < len;i++){
      $("#chatLog").append("<p><strong>"+data[i].user+":</strong> "+data[i].content+"</p>");
    }    
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
    notificationSocket.emit('getUploadedFiles');
  });
  notificationSocket.on('refreshUserList',function refreshUserListNotification(data){
    $("#users").html("");    
    for(var key in data){
      if(data.hasOwnProperty(key)){
        $("#users").append("<li>"+key+"</li>");
      }
    }
  });
  notificationSocket.on('refreshFileList',function refreshUserListNotification(data){
    $("#filePanel").html("");        
    for(var i=0; i<data.length;i++){
      $("#filePanel").append("<div class=\"chatBlock\"><a href=\"#\"><input type=\"hidden\" name=\"fileName\" value=\"" + data[i] + "\"/> <span>" + data[i] + "</span></a></div>");
      //$("#filePanel").append("<li>"+data[i]+"</li>");
    }
    var draggableContent = $("#filePanel a");
    $.each(draggableContent, function() {
        $(this).draggable();
    });
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
    $("#to").val($(this).text());
  });
  // Files stuff    
  function getPreviewOfFile(nameOfFile) {
    var type = "";
    var container = ""
    $.ajax({
        type: "GET",
        contentType: "JSON",
        url: "/getMimeType",
        data: {
            nameOfFile: nameOfFile
        }
    }).done(function(response) {        
        type = response['Content-Type'];        
        var splittedType = type.split("/");
        if (splittedType[0] == "image") {
            container = "<img class=\"imagePreview\" src=\"/uploads/" + nameOfFile + "\"/>";
        } else if (splittedType[0] == "video") {
            container = "<div style=\"margin:200px 0 0 0;\"><video controls autoplay name=\"media\">";
            container += "<source src=\"/uploads/" + nameOfFile + "\" type=\"" + type + "\"/>";
            container += "</video></div>";
        } else if (splittedType[0] == "audio") {
            container = "<div style=\"margin:200px 0 0 0;\"><video controls autoplay name=\"media\">";
            container += "<source src=\"/uploads/" + nameOfFile + "\" type=\"" + type + "\"/>";
            container += "</video></div>";
        } else if (splittedType[0] == "text") {
            container = "<iframe src=\"/uploads/" + nameOfFile + "\" width=\"100%\" height=\"100%\" frameborder=\"0\">";
        } else {
            container = "<h3>Contenido no soportado</h3>"
        }
        $("#previewContent").html(container);
    });
  }
  // File drag and preview
  $("#preview").droppable({
    drop: function(event, ui) {
      var $element = ui.draggable;      
      var nameOfFile = $element.find("input").val();      
      $element.fadeOut(function() {
          notificationSocket.emit('getUploadedFiles');
      });
      $("#titleReceiver").html("Vista previa [" + nameOfFile + "]")
      getPreviewOfFile(nameOfFile);
    }
  });
  // Initializing the board and variables
    // Creating literally canvas board instance
    window.board = LC.init(
      document.getElementsByClassName("literally localstorage")[0], 
      {
        imageURLPrefix: '/images',
        tools:[
          LC.tools.Pencil,
          LC.tools.Eraser          
        ]
      });
    var canvas = (document.getElementsByTagName("canvas")[1]);
    var canvasContext = canvas.getContext("2d");        
    // Sockets events    
    var boardSocket = io.connect('/boardNamespace');    
    boardSocket.on('connect', function connectedToSocket(){      
      boardSocket.emit('getLastContent', null);
    });    
    boardSocket.on('image', function(data){                  
      if(data){
        board.saveShape(LC.createShape(data.shape.type, {points:data.shape.points}));   
      }      
    });        
    // Board functions
    function emitContent(){
      var data = {};                  
      var undoStackLength = board.undoStack.length; 
      var redoStackLength = board.redoStack.length; 
      // Just enabling three undo/redo events
      board.undoStack = (board.undoStack).slice(undoStackLength-3,undoStackLength);
      board.redoStack = (board.redoStack).slice(redoStackLength-3,redoStackLength);            
      var lastShape = board.shapes[board.shapes.length-1];      
      data.shape = {
        'points' : lastShape.points,
        'type': lastShape.__proto__.className
      }
      boardSocket.emit('sync', data);
    }
    board.on('drawStart', function() {
      emitContent();
    });    
    board.on('drawEnd', function() {
      emitContent();
    });    
    board.on('clear',function(){
      emitContent();
    });
    board.on('undo',function(){
      emitContent();
    });
    board.on('redo',function(){
      emitContent();
    });
    board.on('redo',function(){
      emitContent();
    });      
});