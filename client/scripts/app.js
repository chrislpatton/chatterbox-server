// YOUR CODE HERE:
var app;

$(document).on('ready', function(){
  

  app = {
  
  //===============================================================
  //  app properties
  // ==============================================================
    username: 'anonymous',
    
    chatroom: 'lobby',
    
    server: 'https://api.parse.com/1/classes/chatterbox',
    
    friends:{},
      
  
  //===============================================================
  //  app methods---- get messages and displays them to the dom
  // ==============================================================  
    fetch: function(){
      
      $.ajax({
        // This is the url you should use to communicate with the parse API server.
        url: app.server,
        type: 'GET',
        data: {order: '-createdAt'},
        contentType: 'application/json', 
        success: function (data) {
          console.log('chatterbox: Message sent. Data: ', data);
          //get the data for the room names
          app.getRoomData(data.results);
          //get the message data
          app.getMessages(data.results);
        },
        error: function (data) {
          // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to send message. Error: ', data);
        }
      });
    },
    
    addMessage: function(data){
      if (!data.roomname){
        data.roomname = 'lobby';
      }
      if (data.roomname === app.chatroom){
        var $chat = $('<div class="chat"></div>');
        
        var $username = $('<span class="username"></span>');
        $username.text(data.username + ":")
        .attr('data-username',data.username)
        .attr('data-roomname',data.roomname)
        .appendTo($chat);
        
        if (app.friends[data.username] === true){
          $username.addClass('friends')
        }
        
        var $message = $('<br/><span></span>');
        $message.text(data.text)
        .appendTo($chat);
        
        var $timeStamp = $('</br><span></span>');
        var date = new Date(data.createdAt);
        $timeStamp.text(date)
        .appendTo($chat);
        
        app.$chats.append($chat);
      }
    },

    clearMessages: function(){
      app.$chats.empty();
    },

    getMessages: function(results){
      app.clearMessages();
      if (Array.isArray(results)){ 
       _.each(results, app.addMessage); 
      }
    },

  
  //===============================================================
  //  app methods----- retrieve room data and append new rooms
  // ==============================================================
  
    getRoomData: function(results){
      app.$roomSelect.html('<option value="__newRoom">New Room</option><option value="" selected>Lobby</option>');
      
      if (results) {
        var fetchedRoomData = {} ;
        
        if(app.chatroom !== 'lobby'){
          app.addRoom(app.chatroom)
            fetchedRoomData[app.chatroom] = true;
          }
        _.each(results, function(data){
          var roomname =data.roomname;
          if (roomname && !fetchedRoomData[roomname]){
            app.addRoom(roomname);
            
            fetchedRoomData[roomname] = true;
          }
        });
      }
      
      app.$roomSelect.val(app.chatroom);
    },
    
    addRoom: function(roomname){
      $option = $('<option></option>').val(roomname).text(roomname);
      app.$roomSelect.append($option);
      console.log(roomname);
    },
    
    
    storeRoom: function(evt){
      var selectedIndex = app.$roomSelect.prop('selectedIndex');
      
      if (selectedIndex === 0) {
        var roomname = prompt("What would you like to call your new room");
        if (roomname){
          app.chatroom  = roomname;
          app.addRoom(roomname);
          app.$roomSelect.val(roomname);
          app.fetch();
        }
        
      } else {
        app.chatroom = app.$roomSelect.val();
        
        app.fetch();
      }
    },
    
    
  
  //===============================================================
  //  app methods--- to send messages to chatterbox 
  // ==============================================================  
    
    send: function(data){
      
      $.ajax({
        // This is the url you should use to communicate with the parse API server.
        url: app.server,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json', 
        success: function (data) {
          //console.log('chatterbox: Message sent. Data: ', data);
          app.fetch();
        },
        error: function (data) {
          // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to send message. Error: ', data);
        }
      });
      
    },
    
    
    handleSubmit: function(evt){
      evt.preventDefault();
      
      var message = {
        
        username: app.username,
        roomname: app.chatroom || 'lobby',
        text: app.$message.val()
        
      };
        
      app.send(message);  
    },
    
    
 
  //===============================================================
  //  app method-- this allows user to add friend 
  // ==============================================================   
    addFriend: function(evt){
      var username = $(evt.currentTarget)
        .attr('data-username');
        
        if(username !== undefined){
         
        app.friends[username] = true;
        
        var selector = '[data-username="' + username + '"]';
        
        $(selector).addClass('friends');
        }
    },
      
 
  //===============================================================
  //  app init method, gets called in index.html, 
  // ==============================================================     
    init : function(){
      app.username = window.location.search.substr(10);//comes from the congig.js file
      
      //cache selectors 
      app.$main = $('#main');
      app.$message = $('#message');
      app.$chats = $('#chats');
      app.$roomSelect = $('#roomSelect');
      app.$send = $('#send');
      
      app.$roomSelect.on('change', app.storeRoom)
      app.$send.on('submit', app.handleSubmit);
      app.$main.on('click', '.username', app.addFriend);
     
      app.fetch();  
      setInterval(app.fetch, 5000);
      
    },
    
  };
});
 