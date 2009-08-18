function appendMessage(aFrom, aMessage) {
  var history = $("history");
  history.appendChild(DT(aFrom));
  history.appendChild(DD(aMessage));
}

function appendXHTMLMessage(aFrom, aMessage) {
  var history = $("history");
  history.appendChild(DT(aFrom));
  history.appendChild(DD().update(aMessage));
}

function appendPresence(aFrom, aTo, aPresenceType) {
  switch (aPresenceType) {
  case "unavailable":
    findContacts(aFrom).forEach(function(x) {
      Element.remove(x);
    });
    syncContactsWithSendtoOptions();
    break;
  case "subscribe":
    var buttonSubscribed   = BUTTON("OK");
    var buttonUnsubscribed = BUTTON("NO");
    var elt0 = LI(SPAN({className: "contact-item-subscribe"},
                       aFrom + "が友達になりたいそうです",
                       buttonSubscribed,
                       buttonUnsubscribed));
    Event.observe(buttonSubscribed, "click", function(e) {
      Musubi.send(<presence to={aFrom} type="subscribed"/>);
      Element.remove(elt0);
      });
    Event.observe(buttonUnsubscribed, "click", function(e) {
      Musubi.send(<presence to={aFrom} type="unsubscribe"/>);
      Element.remove(elt0);
      });
    $("contacts-message").appendChild(elt0);
    break;
  case "subscribed":
    var elt1 = LI(SPAN({className: "contact-item-subscribed"},
                       aFrom + "はOKだそうです。"));
    setTimeout(function(e) {Element.remove(elt1);}, 5000);
    $("contacts-message").appendChild(elt1);
    break;
  case "unsubscribed":
    var elt2 = LI(SPAN({className: "contact-item-unsubscribed"},
                       aFrom + "はNOだそうです。"));
    setTimeout(function(e) {Element.remove(elt2);}, 5000);
    $("contacts-message").appendChild(elt2);
    break;
  default:
    var p = Musubi.parseJID(aFrom);
    var o = Musubi.parseURI(document.location.href);
    if (o && o.account == (p ? p.jid : aFrom)) break;
    if (findContacts(aFrom).length) break;
    var elt3 = LI(SPAN({className: "contact-item"}, aFrom));
    Event.observe(elt3, "click", openContact(aFrom, aTo));
    $("contacts").appendChild(elt3);
    syncContactsWithSendtoOptions();
    break;
  }
}

function findContacts(aFrom) {
  var res = [];
  var arr = $("contacts").childElements();
  var p0 = Musubi.parseJID(aFrom);
  for (var i = 0, len = arr.length; i < len; i++) {
    var contactAddress = arr[i].down().textContent;
    if (p0.resource == null) {
      var p1 = Musubi.parseJID(contactAddress);
      if (p0.jid == (p1 ? p1.jid : contactAddress)) res.push(arr[i]);
    } else {
      if (p0.fulljid == contactAddress) res.push(arr[i]);
    }
  }
  return res;
}

function syncContactsWithSendtoOptions() {
  var selectSendto = $("sendto");
  while (selectSendto.firstChild)
    selectSendto.removeChild(selectSendto.firstChild);
  var df = document.createDocumentFragment();
  $("contacts").childElements().forEach(function(x) {
    var value = x.down().textContent;
    df.appendChild(OPTION({value: value}, value));
  });
  selectSendto.appendChild(df);
}

function appendRoster(aFrom, aItems) {
  var df = document.createDocumentFragment();
  for (var i = 0, len = aItems.length(); i < len; i++) {
    var jid = aItems[i].@jid.toString();
    if (findContacts(jid).length) continue;
    var elt = LI(SPAN({className: "contact-item"}, jid));
    Event.observe(elt, "click", openContact(jid, aFrom));
    df.appendChild(elt);
  }
  $("contacts").appendChild(df);
  syncContactsWithSendtoOptions();
}

function send() {
  var value = $F("msg");
  Musubi.send(<message type="chat">
	              <body>{value}</body>
              </message>);
  appendMessage("me", value);
  Field.clear("msg");
}

function recv(xml) {
  switch (xml.name().localName) {
  case "message":
    var nsXHTMLIm = new Namespace("http://jabber.org/protocol/xhtml-im");
    var nsXHTML   = new Namespace("http://www.w3.org/1999/xhtml");
    if (xml.nsXHTMLIm::html.nsXHTML::body.length()) {
      appendXHTMLMessage(xml.@from.toString(),
                         xml.nsXHTMLIm::html.nsXHTML::body.toString());
    } else {
      appendMessage(xml.@from.toString(),
                    xml.body.toString());
    }
    break;
  case "presence":
    if (xml.@from.length()) {
      appendPresence(xml.@from.toString(),
                     xml.@to.toString(),
                     xml.@type.toString());
    }
    break;
  case "iq":
    if (xml.@type == "result") {
      var nsIQRoster = new Namespace("jabber:iq:roster");
      if (xml.nsIQRoster::query.length() && xml.nsIQRoster::query.nsIQRoster::item.length()) {
        appendRoster(xml.@from.toString(), xml.nsIQRoster::query.nsIQRoster::item);
      }
    }
  }
  var historyContainer = $("history-container");
  historyContainer.scrollTop = historyContainer.scrollHeight;
}

function openContact(aFrom, aTo) {
  return function(e) {
    Musubi.send(<musubi type="get">
                  <opencontanct>
                    <account>{aTo}</account>
                    <contact>{aFrom}</contact>
                  </opencontanct>
                </musubi>);
  };
}

function recvTest0() {
  recv(<message from="romeo@localhost">
         <body>"hello, world."</body>
       </message>);
}

function recvTest1() {
  recv(<message from="romeo@localhost">
         <body>hello world</body>
         <x xmlns="jabber:x:oob">
           <url>http://www.google.co.jp</url>
           <desc>Google</desc>
         </x>
       </message>);
}

function recvTest2() {
  recv(<message from="romeo@localhost">
         <body>hi!</body>
         <html xmlns="http://jabber.org/protocol/xhtml-im">
           <body xmlns="http://www.w3.org/1999/xhtml">
             <p style="font-weight:bold">hi!</p>
           </body>
         </html>
       </message>);
}

function recvTest3() {
  recv(<presence from="juliet@localhost"/>);
}

function recvTest4() {
  recv(<presence from="chat@conference.jabber.org/Alice"/>);
  recv(<presence from="chat@conference.jabber.org/Bob"/>);
  recv(<presence from="chat@conference.jabber.org/Charlie"/>);
  recv(<presence from="chat@conference.jabber.org/Dan"/>);
  recv(<presence from="chat@conference.jabber.org/Emily"/>);
  recv(<presence from="chat@conference.jabber.org/Fey"/>);
}

function recvTest5() {
  recv(<presence from="juliet@localhost" type="unavailable"/>);
}

function recvTest6() {
  recv(<presence from="chat@conference.jabber.org" type="unavailable"/>);
}

function recvTest7() {
  recv(<presence from="someone@localhost" type="subscribe"/>);
}

function recvTest8() {
  recv(<iq from="romeo@localhost" to="romeo@localhost/Home" type="result">
         <query xmlns="jabber:iq:roster">
           <item jid="juliet@localhost"/>
           <item jid="lory@wonderland.lit"/>
           <item jid="mouse@wonderland.lit"/>
           <item jid="sister@realworld.lit"/>
         </query>
       </iq>);
}

function recvTest9() {
  recv(<iq from="juliet@localhost" to="juliet@localhost/Home" type="result"/>);
}

Event.observe(window, "load", function (e) {
  Builder.dump(window);
  Musubi.init();
  Musubi.onRecv = recv;
  var o = Musubi.parseURI(document.location.href);
  if (o) {
    Musubi.send(<musubi type="get">
                  <cachedpresences from={o.account}/>
                </musubi>);
    Musubi.send(<iq from={o.jid} to={o.account} type="get">
                  <query xmlns="jabber:iq:roster"/>
                </iq>);
    $("account-container").appendChild(P(A({href: document.location.href},
                                           o.account)));
  }
  Event.observe("chat", "submit", function(e) {
    send();
    Event.stop(e);
  });
});
