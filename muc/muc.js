var mynicks = [];

function joinRoom() {
  var nick = $("nickname").value;
  if (nick) {
    if (/\?create$/.test(document.location.href)) {
      Musubi.send(<presence rsrc={nick}>
                    <x xmlns="http://jabber.org/protocol/muc"/>
                  </presence>);
    } else {
      Musubi.send(<presence rsrc={nick}/>);
    }
    mynicks.push(nick);
  }
  $("guide").hide();
  $("comment-form").show();
}

function leaveRoom() {
  for (var i = 0; i < mynicks.length; i++) {
    Musubi.send(<presence rsrc={mynicks[i]} type="unavailable"/>);
  }
  $("comment-form").hide();
}

function appendMessage(aFrom, aBody) {
  var history = $("history");
  history.appendChild(new Element("dt").update(aFrom));
  history.appendChild(new Element("dd").update(aBody));
}

function send() {
  var xml = <message type="groupchat">
	            <body>{$("comment-textarea").value}</body>
            </message>;
  Musubi.send(xml);
  $("comment-textarea").value = "";
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
    var participants = $("participants");
    var descs = xml.*;
    if (xml.@type == "error") {
      participants.appendChild(new Element("h1").update("Error"));
      for (var i = 0, len = descs.length(); i < len; i++) {
        participants.appendChild(new Element("p") .update(descs[i].toXMLString()));
      }
      break;
    }
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

function recvTest0() {
  recv(<message from="room@conference.jabbar.org/Alice">
         <body>Hello</body>
       </message>);
}

function recvTest1() {
  recv(<message from="room@conference.jabbar.org">
         <body>Hi all</body>
       </message>);
}

function recvTest2() {
  recv(<presence from="room@conference.jabbar.org/Alice"/>);
  recv(<presence from="room@conference.jabbar.org/Bob"/>);
  recv(<presence from="room@conference.jabbar.org/Charlie"/>);
}

function recvTest3() {
  recv(<presence from="room@conference.jabbar.org/Alice" type="unavailable"/>);
}

function main() {
  Musubi.init(recv);
  Event.observe("comment-form", "submit", function(e) {
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
  var m = /\?room=(.+)$/.exec(Musubi.location.href);
  if (m) $("room-title").appendChild(document.createTextNode(decodeURI(m[1])));
  $("comment-form").hide();
}

Event.observe(window, "load",   main);
Event.observe(window, "unload", leaveRoom);
