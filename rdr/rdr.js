function recv(aXML) {
  aXML.@to = $F("dest");
  Musubi.send(aXML);
}

function main(evt) {
  Musubi.init(recv);
}

Event.observe(window, "load", main);
