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

function recvMUC(xml) {
  switch (xml.name().localName) {
  case "message":
    var nsXhtmlIm = new Namespace("http://jabber.org/protocol/xhtml-im");
    var nsXhtml = new Namespace("http://www.w3.org/1999/xhtml");
    var imgsrc   = xml.nsXhtmlIm::html..nsXhtml::img.@src;
    var imgstyle = xml.nsXhtmlIm::html..nsXhtml::img.@style;
    if (imgsrc.length()) {
      var img = null;
      if (imgstyle.length()) {
        img = new Element("img", {className: "canvas-img-stamp", src: imgsrc, style: imgstyle});
      } else {
        img = new Element("img", {className: "canvas-img", src: imgsrc, width: cnvWidth, height: cnvHeight});
      }
      $("canvas-history").appendChild(img);
    }
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

function mainMUC() {
  chattype = "groupchat";
  Musubi.onRecv = recvMUC;
  Event.observe("form-nickname", "submit", function(e) {
    joinRoom();
    Event.stop(e);
  });
  Event.observe("leave-room", "click", function(e) {
    leaveRoom();
  });
}

Event.observe(window, "load", mainMUC);