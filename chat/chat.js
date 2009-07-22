function appendMessage(aFrom, aMessage) {
  var dt = new Element("dt").update(aFrom);
  var dd = new Element("dd").update(aMessage);
  var history = $("history");
  history.appendChild(dt);
  history.appendChild(dd);
  document.body.scrollTop = document.body.scrollHeight;
}

function send() {
  var xml = <message type="chat">
	            <body>{$F("msg")}</body>
            </message>;
  Musubi.send(xml);
  appendMessage("me", $F("msg"));
  Field.clear("msg");
  return false;
}

function recv(xml) {
  appendMessage(xml.@from.toString(),
                xml.body.toString());
}

Event.observe(window, "load", function (e) {
  Musubi.init();
  Musubi.onRecv = recv;
});
