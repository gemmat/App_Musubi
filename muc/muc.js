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
    $("navigation").style.width = "15%";
    $("extra").style.display = "block";
  }
}

function leaveRoom() {
  for (var i = 0; i < mynicks.length; i++) {
    Musubi.send(<presence res={mynicks[i]} type="unavailable"/>);
  }
}

function appendMessage(aFrom, aBody) {
  var history = $("history");
  history.appendChild(new Element("dt").update(aFrom));
  history.appendChild(new Element("dd").update(aBody));
}

function send() {
  var xml = <message type="groupchat">
	            <body>{$("input").value}</body>
            </message>;
  Musubi.send(xml);
  $("input").value = "";
}

function recv(xml) {
  switch (xml.name().localName) {
  case "message":
    if (xml.@type == "error") {
      appendMessage("Error:" + xml.@from.toString(), xml.toXMLString());
    } else {
      appendMessage(xml.@from.toString(), xml.body.toString());
    }
    break;
  case "presence":
    var nav = $("navigation");
    var descs = xml.*;
    if (xml.@type == "error") {
      nav.appendChild(new Element("h1").update("Error"));
      for (var i = 0, len = descs.length(); i < len; i++) {
        nav.appendChild(new Element("p") .update(descs[i].toXMLString()));
      }
      break;
    }
    var participants = $("participants");
    var p = Musubi.parseJID(xml.@from.toString());
    var nick = p ? p.resource : xml.@from.toString();
    var arr = [];
    participants.childElements().forEach(function(x) {
      if (x.textContent == nick) arr.push(x);
    });
    if (xml.@type == "unavailable") {
      arr.forEach(function(x) {Element.remove(x);});
    } else {
      if (!arr.length) {
        participants.appendChild(new Element("li").update(nick));
      }
    }
    break;
  }
}

function main() {
  Musubi.init(recv);
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
  var m = /\?room=(.+)$/.exec(Musubi.info.frag);
  if (m) $("room-title").appendChild(document.createTextNode(decodeURI(m[1])));
}

Event.observe(window, "load",   main);
Event.observe(window, "unload", leaveRoom);
