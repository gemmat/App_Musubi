function appendMessage(aFrom, aMessage) {
  var history = $("history");
  history.appendChild(DT(IMG({src: "romeo.png", alt: aFrom, title: aFrom}),
                         aFrom));
  history.appendChild(DD(aMessage));
}

function appendXHTMLMessage(aFrom, aMessage) {
  var elt = DD();
  elt.innerHTML = aMessage;
  var history = $("history");
  history.appendChild(DT(aFrom));
  history.appendChild(elt);
}

function appendURLMessage(aFrom, aURL, aMessage) {
  var elt = A({href: aURL}, aMessage);
  Event.observe(elt, "click", function(e) {
    openMsgURL(aFrom, aURL, aMessage);
    Event.stop(e);
  });
  var history = $("history");
  history.appendChild(DT());
  history.appendChild(DD(elt));
}

function appendPresence(aFrom, aTo, aPresenceType) {
  var address = /^[^\/]+/.exec(aFrom);
  if (!address) return;
  aFrom = address[0];
  var arr = [];
  var src = "";
  var alt = (aPresenceType == "unavailable") ? "offline" : "online";
  var i, len;

  arr = $$("span.account-name");
  src = (aPresenceType == "unavailable") ? "offline.png" : "online.png";
  for (i = 0, len = arr.length; i < len; i++) {
    if (arr[i].textContent == aFrom) {
      var input = arr[i].previous();
      input.src = src;
      input.alt = alt;
      if (aPresenceType == "unavailable") {
        input.removeClassName("online");
        input.addClassName("offline");
      } else {
        input.removeClassName("offline");
        input.addClassName("online");
      }
      return;
    }
  }
  arr = $$("span.contact-name");
  src = (aPresenceType == "unavailable") ? "offline.png" : "online.png";
  var notfound = true;
  for (i = 0, len = arr.length; i < len; i++) {
    if (arr[i].textContent == aFrom) {
      var img = arr[i].previous();
      img.src = src;
      img.alt = alt;
      notfound = false;
    }
  }
  var elt = SPAN({className: "contact-name"}, aFrom);
  Event.observe(elt, "click", function(e) {
    Musubi.send(<musubi type="get">
                  <opencontanct>
                    <account>{aTo}</account>
                    <contact>{aFrom}</contact>
                  </opencontanct>
                </musubi>);
    Event.stop(e);
    });
  if (notfound) {
    $("contacts").appendChild(
      LI(IMG({src: src, alt: alt}),
         elt));
  }
}

function appendAccount(aAccountE4X) {
  var address = aAccountE4X.address.toString();
  var elt0 = INPUT({type: "image", src: "offline.png", alt: "click here to connect", className: "offline"});
  Event.observe(elt0, "click", function(e) {
    if (e.target.hasClassName("offline")) {
      connect(address);
    } else {
      disconnect(address);
    }
    Event.stop(e);
  });
  var elt1 = SPAN({className: "account-name"}, address);
  Event.observe(elt1, "click", function(e) {
    if (e.target.previous().hasClassName("offline")) {
      connect(address);
    } else {
      disconnect(address);
    }
    Event.stop(e);
  });
  $("accounts").appendChild(LI(elt0, elt1));
}

function send() {
  Musubi.send(<message type="chat">
	              <body>{$F("msg")}</body>
              </message>);
  appendMessage("me", $F("msg"));
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
    var nsJabberXOOB = new Namespace("jabber:x:oob");
    if (xml.nsJabberXOOB::x.nsJabberXOOB::url.length()) {
      appendURLMessage(xml.@from.toString(),
                       xml.nsJabberXOOB::x.nsJabberXOOB::url.toString(),
                       xml.nsJabberXOOB::x.nsJabberXOOB::desc.toString());
    }
    break;
  case "presence":
    appendPresence(xml.@from.toString(), xml.@to.toString(), xml.@type.toString());
    break;
  case "musubi":
    if (xml.@type == "result" && xml.accounts.length()) {
      for (var i = 0, len = xml.accounts.account.length(); i < len; i++) {
        appendAccount(xml.accounts.account[i]);
      }
    }
    break;
  }
  var historyContainer = $("history-container");
  historyContainer.scrollTop = historyContainer.scrollHeight;
}

function connect(aAddress) {
  Musubi.send(<musubi type="set"><connect>{aAddress}</connect></musubi>);
}

function disconnect(aAddress) {
  Musubi.send(<musubi type="set"><disconnect>{aAddress}</disconnect></musubi>);
}

function openMsgURL(aFrom, aURL, aMessage) {
  Musubi.send(<musubi type="get">
                 <urlmsg>
                   <from>{aFrom}</from>
                   <url>{aURL}</url>
                   <desc>{aMessage}</desc>
                 </urlmsg>
               </musubi>);
}

function openMsgSender(evt) {
  Musubi.send(<musubi type="get">
                 <sender>{evt.target.innerHTML}</sender>
               </musubi>);
  Event.stop(evt);
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
           <url>"http://www.google.co.jp"</url>
           <desc>"Google"</desc>
         </x>
       </message>);
}

function recvTest2() {
  recv(<message from="romeo@localhost">
         <body>hello world</body>
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
  recv(<presence from="juliet@localhost" type="unavailable"/>);
}

function recvTest5() {
  recv(<presence from="someone@localhost"/>);
}

function recvTest6() {
  recv(<musubi type="result">
         <accounts>
           <account id="3">
             <name>romeo</name>
             <domain>localhost</domain>
             <resource>Musubi</resource>
             <jid>romeo@localhost/Musubi</jid>
             <address>romeo@localhost</address>
             <connectionHost>localhost</connectionHost>
             <connectionPort>5223</connectionPort>
             <connectionSecurity>0</connectionSecurity>
             <comment></comment>
           </account>
           <account id="4">
             <name>juliet</name>
             <domain>gmail</domain>
             <resource>Musubi</resource>
             <jid>teruakigemma@gmail/Musubi</jid>
             <address>teruakigemma@gmail</address>
             <connectionHost>talk.google.com</connectionHost>
             <connectionPort>443</connectionPort>
             <connectionSecurity>1</connectionSecurity>
             <comment></comment>
           </account>
         </accounts>
       </musubi>);
}

Event.observe(window, "load", function (e) {
  Builder.dump(window);
  Musubi.init();
  Musubi.onRecv = recv;
  Musubi.send(<musubi type="get">
                <accounts/>
              </musubi>);
  Musubi.send(<musubi type="get">
                <cachedpresences/>
              </musubi>);
  Event.observe("chat", "submit", function(e) {
    send();
    Event.stop(e);
  });
});
