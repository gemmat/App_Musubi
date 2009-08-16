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
  var arr = $$("span.contact-item");
  var found = false;
  for (var i = 0, len = arr.length; i < len; i++) {
    var m = /^([^\/]+)/.exec(arr[i].textContent);
    var from = m ? m[1] : arr[i].textContent;
    if (from == aFrom) {
      if (aPresenceType == "unavailable") {
        Element.remove(arr[i]);
      }
      found = true;
    }
  }
  if (found || aPresenceType == "unavailable") return;
  var elt = SPAN({className: "contact-item"}, aFrom);
  Event.observe(elt, "click", openContact(aFrom, aTo));
  $("contacts").appendChild(LI(elt));
}

function appendAccount(aAddress) {
  var elt = SPAN({className: "account-name"}, INPUT({type: "checkbox"}), aAddress);
  Event.observe(elt, "click", function(e) {
    e.target.down().checked ? disconnect(aAddress) : connect(aAddress);
    Event.stop(e);
  });
  Event.observe(elt.down(), "click", function(e) {
    e.target.checked ? disconnect(aAddress) : connect(aAddress);
    Event.stop(e);
  });
  $("accounts").appendChild(LI(elt));
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
    break;
  case "presence":
    appendPresence(xml.@from.toString(), xml.@to.toString(), xml.@type.toString());
    break;
  case "musubi":
    if (xml.@type == "result" && xml.accounts.length()) {
      for (var i = 0, len = xml.accounts.account.length(); i < len; i++) {
        appendAccount(xml.accounts.account[i].address.toString());
      }
    }
    if (xml.@type == "result" && xml.connect.length()) {
      var arr = $$("span.account-name");
      for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i].textContent == xml.connect) {
          arr[i].down().checked = true;
        }
      }
    }
    if (xml.@type == "result" && xml.disconnect.length()) {
      var arr = $$("span.account-name");
      for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i].textContent == xml.disconnect) {
          arr[i].down().checked = false;
        }
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

function recvTest8() {
  recv(<musubi type="result">
         <connect>romeo@localhost</connect>
       </musubi>);
}

function recvTest9() {
  recv(<musubi type="result">
         <disconnect>romeo@localhost</disconnect>
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
