var hostname = window.location.hostname;

$(document).on('click touchstart', '#on', function(e){
  e.preventDefault();
  $.get("/light?state=on", lightState);
});

$(document).on('click touchstart', '#off', function(e){
  e.preventDefault();
  $.get("/light?state=off", lightState);
});

$(document).on('click touchstart', '#update', function(e){
  e.preventDefault();
  var config = {};
  
  config.JID = $('#usr').val();
  config.PASSWORD = $('#pwd').val();
  config.HOST = $('#host').val();
  config.MONITOR = $('#watch').val();
  var words = $('#words').val();
  var re = /\s*,\s*/;
  words = words.split(re);
  var keywords = {words: words};
  if($('#XMPP').is(':checked')) {
    config.MODE = 'XMPP';
  }else{
    config.MODE = 'manual';
  }

  //console.log(JSON.stringify(config, null, 2));
  $.ajax({
    type: "POST",
    url: '/update/',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({config: config, keywords: keywords})
  }).done(function(result){
    console.log("config reset");
    setTimeout(function(){ 
      window.location = '/';
    }, 3000);
    
  });
});

function lightState(){
  $.get("/light?state=status", function(result){
    if(result.status){
      $('#status').html('<i class="fa fa-lightbulb-o fa-2x" aria-hidden="true" style="color: red;"></i>');
    }else{
      $('#status').html('<i class="fa fa-lightbulb-o fa-2x" aria-hidden="true"></i>');
    }
  });
}

function status(){
  $.get('/status', function(result){
          console.log(result.mode);
    if(result.client == 'online' && !result.statusText){
      $('#statusMessage').html("Available");
    }else{
      $('#statusMessage').html(result.statusText);
    }
    $('#statusClient').html(result.client);
    var date = new Date(result.timestamp);
    $('#statusUpdate').html(date.toLocaleString());
    if(result.mode == 'XMPP'){

      $('#mode').html(result.mode);
      $('#monitor').html(result.monitor);
    }
  });
}

$(function() {
  if ($('body').data('title') === 'On-Air') {
    status();
    lightState();

  var socket = io.connect(hostname+":3000");
  socket.on('connect', function(){
    socket.emit();
    console.log('socket io connected');
  });

  socket.on('broadcast', function(data){
    status();
    lightState();
  });
  }else if($('body').data('title') === 'On-Air: Setup') {

  }
});
