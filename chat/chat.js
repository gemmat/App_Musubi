function send() {
  var xml = <message type="chat">
	            <body>{document.getElementById("msg").value}</body>
            </message>;
  Musubi.send(xml);
  recv(xml);
}

function recv(xml) {
  document.body.innerHTML += (xml.@from.length() ? xml.@from : "me") + ":" + xml.body + "<br/>";
}

window.onload = function () {
  Musubi.init();
  Musubi.onRecv = recv;
};
