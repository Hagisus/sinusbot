$(function(){

  console.log("OK");

  var address = "http://ts3.kgrzeg.pl:8087"

  $.ajax(address+"/api/v1/bot/info",
    {headers: {"Authorization": "bearer "+localStorage.getItem("token")}}
  ).done(function(data){
    console.log("Data received:", data)
  })

})