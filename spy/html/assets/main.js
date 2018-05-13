$(function(){
  var current_instance = null
  var channels_tree = []
  var channels = []
  var clients = new Set()

  function doRequest(url, data){
    var req_settings = {
      headers: {"Authorization": "bearer "+localStorage.getItem("token")},
      dataType: "json",
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
        $("#select_instance_options").append(
          $('<a class="dropdown-item" href="#">')
            .data("uuid", instance["uuid"])
            .text(instance["nick"])
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
          name: "server",
          parent: -1,
          order: -1,
          clients: [],
          children: []
        }

        data.forEach((channel)=>{
          //copy data from request to array
          _channels[channel["id"]] = {
            id: channel.id,
            name: channel.name,
            parent: channel.parent,
            order: channel.order,
            clients: channel.clients,
            maxClients: channel.maxClients,
            children: [],
          };
        })

        //fill children array and limit clients info
        _channels.forEach((channel)=>{
          if (channel.parent != -1)
            _channels[channel.parent].children.push(channel)
          if (channel.order > 0) _channels[channel.order].next = channel

          channel.clients = channel.clients.map((client)=>{
            return {
              id: client.id,
              uid: client.uid,
              groups: client.g,
              nick: client.nick
            }
          })

          //copy clients
          channel.clients.sort( (a,b)=>{return a.nick.localeCompare(b.nick)})
          channel.clients.forEach((client)=>{
            clients.add(client)
          })

          channels[channel.id] = $.extend({},channel)
        })
        delete _channels[0].next

        //remove excess channels
        channels_tree[0] = _channels[0]

        //sort children
        var sortChildren = function(parent){
          //make sure, that the order:0 is the first child
          parent.children.sort( (a,b) => {return a.order-b.order;} )

          parent.children.forEach( (child)=>{
            sortChildren(child)
          })
        }
        sortChildren(channels_tree[0])
        
        renderChannels()
      })
  }
  function fillClients(){
    $target =  $("#message_target").empty()
    clients.forEach( (client) =>{
      $("<option>")
        .val(client.id)
        .text(client.nick)
        .appendTo($target)
    })
  }

  function changeInstance(uuid, name){
    current_instance = {uuid, name}

    fillChannels()
    fillClients()
  }

  function attachInstancesDropdown(){
    $("#select_instance_options")
      .children()
      .off("click")
      .click( function(e){
        $t = $(e.target)
        $("#select_instance").text( $t.text() )

        changeInstance($t.data("uuid"), $t.text())
      })
  }
  function attachRefreshButtons(){
    $("#refresh_channels_button")
      .off("click")
      .click((e)=>{
        fillChannels()
      })
  }

  function renderClients($root, clients){
    clients.forEach( (client)=>{
      $("<li>")
        .addClass("client" + (client.nick == current_instance.name ? " me" : ""))
        .text(client.nick)
        .attr("id", "client_"+client.id)
        .data('client_id', client.id)
        .appendTo($root)
    })
  }

  function renderChannel($root, channel){
    var element
    var spacer_re = /^\[spacer\d+\]$/

    while(true){
      element = $("<li>")
          .addClass("channel")
          .attr("id", "channel_"+channel.id)
          .data('channel_id', channel.id)
          
      if (!spacer_re.test(channel.name)){
        //normal channel with name
        element
          .addClass(channel.maxClients != 0 ? "opened" : "closed")
          .text(channel.name)
        
      }else{
        //spacer
        element.html("&nbsp;")
      }

      element.appendTo($root)

      //clients and children channels
      if (channel.children.length > 0 || channel.clients.length > 0){
        var $children = $("<ul>").appendTo($root)

        if (channel.clients.length > 0 ) renderClients($children, channel.clients)
        if (channel.children.length > 0) renderChannel($children, channel.children[0])
      }
      
      if (!channel.next)
        break
      channel = channel.next
    }
  }

  function renderChannels(){
    var $root = $("#roomsTree").empty()
    renderChannel($root, channels_tree[0])
  }

  function initialize(){
    fillInstances()
      .done(attachInstancesDropdown)
      .done(attachRefreshButtons)
      .done(()=>{ //select first instance
        $("#select_instance_options").children().first().click()
      })
  }

  initialize()
  
  //temporary variable for debugging purposes
  window.__debuggk = this
})