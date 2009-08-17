function appendAccount(aAddress) {
  var elt = A({href: "xmpp://" + aAddress + "/" + aAddress + "?share;href=sidebar2.html"}, aAddress);
  Event.observe(elt, "click", function(e) {
    connect(e.target.textContent);
  });
  $("accounts").appendChild(LI(elt));
}

function recv(xml) {
  switch (xml.name().localName) {
  case "musubi":
    if (xml.@type == "result" && xml.accounts.length()) {
      for (var i = 0, len = xml.accounts.account.length(); i < len; i++) {
        appendAccount(xml.accounts.account[i].address.toString());
      }
    }
    break;
  }
}

function connect(aAddress) {
  Musubi.send(<musubi type="set"><connect>{aAddress}</connect></musubi>);
}

function recvTest0() {
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
             <name>teruakigemma</name>
             <domain>gmail</domain>
             <resource>Musubi</resource>
             <jid>teruakigemma@gmail/Musubi</jid>
             <address>teruakigemma@gmail.com</address>
             <connectionHost>talk.google.com</connectionHost>
             <connectionPort>443</connectionPort>
             <connectionSecurity>1</connectionSecurity>
             <comment></comment>
           </account>
         </accounts>
       </musubi>);
}

function recvTest1() {
  recv(<musubi type="result">
         <connect>romeo@localhost</connect>
       </musubi>);
}


Event.observe(window, "load", function (e) {
  Builder.dump(window);
  Musubi.init();
  Musubi.onRecv = recv;
  Musubi.send(<musubi type="get">
                <accounts/>
              </musubi>);
});
