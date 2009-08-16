var mynicks = [];

function joinRoom() {
  var nick = $("nickname").value;
  if (nick) {
    if (/\?create$/.test(document.location.href)) {
      Musubi.send(<presence res={nick}>
                    <x xmlns="http://jabber.org/protocol/muc"/>
                  </presence>);
    } else {
      Musubi.send(<presence res={nick}/>);
    }
    mynicks.push(nick);
  }
}

function leaveRoom() {
  for (var i = 0; i < mynicks.length; i++) {
    Musubi.send(<presence res={mynicks[i]} type="unavailable"/>);
  }
}

function appendMessage(aFrom, aBody) {
  var m = /\/(.+)$/.exec(aFrom);
  if (m) aFrom = m[1];
  var history = $("history");
  history.appendChild(new Element("dt").update(aFrom));
  history.appendChild(new Element("dd").update(aBody));
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
  switch (xml.name().localName) {
  case "message":
    appendMessage(xml.@from.toString(), xml.body.toString());
    break;
  case "presence":
    var nav = $("navigation");
    var descs = xml.*;
    for (var i = 0, len = descs.length(); i < len; i++) {
      nav.appendChild(new Element("p") .update(descs[i].toXMLString()));
    }
    if (xml.@type == "error") {
      nav.appendChild(new Element("h1").update("Error"));
      break;
    }
    var participants = $("participants");
    var from = xml.@from.toString();
    var nick = /\/(.*)$/.exec(from);
    if (xml.@type == "unavailable") {
      participants.descendants().forEach(function(x) {
        if (x.textContent == nick) Element.remove(x);
      });
      break;
    }
    participants.appendChild(new Element("li").update(nick ? nick[1] : from));
    break;
  }
}

function main() {
  Musubi.init();
  Musubi.onRecv = recv;
  Event.observe("form-msg", "submit", function(e) {
    send();
    Event.stop(e);
  });
  Event.observe("form-nickname", "submit", function(e) {
    joinRoom();
    Event.stop(e);
  });
  Event.observe("leave-room", "click", function(e) {
    leaveRoom();
  });
}

Event.observe(window, "load",   main);
Event.observe(window, "unload", leaveRoom);
