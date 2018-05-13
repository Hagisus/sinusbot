$(function(){
  var current_instance = null;

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

  function requestChannels(instanceId){
    return doRequest("/api/v1/bot/i/"+instanceId+"/channels")
  }

  function fillInstances(){

    requestInstances().done(function(data){
      data.forEach((instance)=>{
        $('#select_instance_options').append(
          $('<ac lass="dropdown-item" href="#">')
            .data('uuid', instance['uuid'])
            .text(instance['nick'])
        )
      })
      
    })

  }

  function initialize(){
    fillInstances()
  }

  initialize()
})