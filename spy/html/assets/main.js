$(function(){
  var current_instance = null
  var channels_tree = []
  var channels = new Set()
  var clients = new Set()

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
        var _channels = []
        clients.clear()

        //the server
        _channels[0] = {
          id: 0,
          name: 'server',
          parent: -1,
          order: 0,
          clients: [],
          children: []
        }

        data.forEach((channel)=>{
          //copy data from request to array
          _channels[channel['id']] = {
            id: channel.id,
            name: channel.name,
            parent: channel.parent,
            order: channel.order,
            clients: channel.clients,
            children: [],
          };
        })

        //fill children array and limit clients info
        _channels.forEach((channel)=>{
          if (channel.parent != -1)
            _channels[channel.parent].children.push(channel)
          channel.clients = channel.clients.map((client)=>{
            return {
              id: client.id,
              uid: client.uid,
              groups: client.g,
              nick: client.nick
            }
          })

          //copy clients
          channel.clients.forEach((client)=>{
            clients.add({client})
          })

          channels.add(channel)
        })

        //remove excess channels
        channels_tree[0] = _channels[0]

        //sort children
        var sortChildren = function(parent){
          parent.children.sort(
            (a,b) => {return a.order > b.order}
          )
          parent.children.forEach( (child)=>{
            sortChildren(child)
          })
        }
        sortChildren(channels_tree[0])
        
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
    console.log(channels_tree, channels, clients)
  }

  function initialize(){
    fillInstances()
      .done(attachInstancesDropdown)
  }

  initialize()
  
  //temporary variable for debugging purposes
  window.__debuggk = this
})