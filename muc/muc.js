function joinRoom() {
  var xml = <presence/>;
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

window.onload = main;