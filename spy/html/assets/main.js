$(function(){
  var current_instance = null;
  var channels = [];
  var clients = new Set();

  function doRequest(url, data){
    var req_settings = {
      headers: {"Authorization": "bearer "+localStorage.getItem("token")},
      dataType: 'json',
    }
    if (data){
      req_settings.headers["Content-Type"] = "application/json"
      req_settings.method = "POST"
      req_settings.data = data
    }

    return $.ajax(url, req_settings)
  }
  function requestInstances(){
    return doRequest("/api/v1/bot/instances")
  }
  function requestChannels(){
    return doRequest("/api/v1/bot/i/"+current_instance.uuid+"/channels")
  }

  function fillInstances(){

    return requestInstances().done(function(data){
      data.forEach((instance)=>{
        $('#select_instance_options').append(
          $('<a class="dropdown-item" href="#">')
            .data('uuid', instance['uuid'])
            .text(instance['nick'])
        )
      })
      
    })

  }
  function fillChannels(){
    requestChannels()
      .done(function(data){
        //reset data
        channels = []
        clients.clear()

        //the server
        channels[0] = {
          id: 0,
          name: 'server',
          parent: 0,
          order: 0,
          clients: [],
          children: []
        }

        data.forEach((channel)=>{
          //copy data from request to array
          channels[channel['id']] = {
            id: channel.id,
            name: channel.name,
            parent: channel.parent,
            order: channel.order,
            clients: channel.clients,
            children: [],
          };
        })

        //fill children array and limit clients info
        channels.forEach((channel)=>{
          channels[channel.parent].children.push(channel)
          channel.clients = channel.clients.map((client)=>{
            return {
              id: client.id,
              uid: client.uid,
              groupts: client.g,
              nick: client.nick
            }
          })

          //copy clients
          channel.clients.forEach((client)=>{
            clients.add({client})
          })
        })

        //sort children
        var sortChildren = function(parent){
          parent.children.sort(
            (a,b) => {return a.order > b.order}
          )
          parent.children.forEach( (child)=>{
            sortChildren(child)
          })
        }
        //sortChildren(channels[0])
        
        renderChannels()
      })
  }

  function changeInstance(uuid, name){
    current_instance = {uuid, name}
    fillChannels()
  }

  function attachInstancesDropdown(){
    $('#select_instance_options').children().click( function(e){
      $t = $(e.target)
      $('#select_instance').text( $t.text() )

      changeInstance($t.data('uuid'), $t.text())
    })
  }
  function renderChannels(){
    console.log(channels, clients)
  }

  function initialize(){
    fillInstances()
      .done(attachInstancesDropdown)
  }

  initialize()
  
  //temporary variable for debugging purposes
  window.__debuggk = this
})