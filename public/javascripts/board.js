$(document).ready(function documentReady(){
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