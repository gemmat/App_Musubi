function joinRoom() {
  var xml = <presence/>;
  Musubi.send(xml);
}

function leaveRoom() {
  var xml = <presence type="unavailable"/>;
  Musubi.send(xml);
}

function send() {
  var xml = <message type="groupchat">
	            <body>{$("msg").value}</body>
            </message>;
  Musubi.send(xml);
  recv(xml);
  $("msg").value = "";
}

function recv(xml) {
  $("history").appendChild(new Element("dt").update(xml.@from.toString() || "me"));
  $("history").appendChild(new Element("dd").update(xml.body.toString()));
}

function main() {
  Musubi.init();
  Musubi.onRecv = recv;
  joinRoom();
}

Event.observe(window, "load",   main);
Event.observe(window, "unload", leaveRoom);
