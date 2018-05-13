$(function(){

  console.log("OK");

  const address = "http://127.0.0.1:8087"

  var current_instance = null;

  function doRequest(url, data){
    var headers = {"Authorization": "bearer "+localStorage.getItem("token")}

    if (data) headers["Content-Type"] = "application/json"

    var method = data ? "POST" : "GET"
    var send_data = data ? JSON.stringify(data) : undefined;

    return request = $.ajax(address+url, {
      headers: headers,
      method: method,
      dataType: 'json',
      data: send_data,
    } )
  }
  function requestInstances(){
    return doRequest("/api/v1/bot/instances")
  }

  function requestChannels(instanceId){
    return doRequest("/api/v1/bot/i/"+instanceId+"/channels")
  }

  function fillInstances(){

    requestInstances().done(function(data){
      for(instance in data){
        $('#select_instance_options').append(
          $('<ac lass="dropdown-item" href="#">')
            .data('uuid', data['uuid'])
            .text(data['nick'])
        )
      }
    })
  }

  function initialize(){
    fillInstances()
  }

  initialize()
})