$(function(){

  console.log("OK");

  var address = "http://ts3.kgrzeg.pl:8087"

  function doRequest(url, data, done, fail, always){
    var headers = {"Authorization": "bearer "+localStorage.getItem("token")}

    if (data) headers["Content-Type"] = "application/json"

    var method = data ? "POST" : "GET"
    var send_data = data ? JSON.stringify(data) : undefined;

    var request = $.ajax(address+url, {
      headers: headers,
      method: method,
      dataType: 'json',
      data: send_data,
    } )

    if (done)   request.done(done)
    if (fail)   request.fail(fail)
    if (always) request.always(always)
  }

})