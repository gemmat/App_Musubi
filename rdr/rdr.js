function recv(aXML) {
  var arr = $("dest").getValue();
  for (var i = 0; i < arr.length; i++) {
    aXML.@to = arr[i];
    Musubi.send(aXML);
  };
}

function main(evt) {
  Musubi.init(recv);
}

Event.observe(window, "load", main);
