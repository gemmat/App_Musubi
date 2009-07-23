function recv(xml) {
  switch (xml.name().localName) {
  case "message":
    break;
  case "musubi":
    if (xml.@type == "result" && xml.accounts.length()) {
      var eltAccounts = $("accounts");
      while (eltAccounts.firstChild) eltAccounts.removeChild(eltAccounts.firstChild);
      var df = document.createDocumentFragment();
      for (var i = 0; i < xml.accounts.account.length(); i++) {
        var account = xml.accounts.account[i];
        var service = {};
        switch (account.domain.toString()) {
        case "gmail":       //FALLTHROUGH
        case "googlemail":
          service = {
                     href:    "gtalk.html",
                     imgsrc:  "gtalk.png",
                     imgalt:  "Google Talk"
                    };
          break;
        default:
          service = {
                     href:    "jabber.html",
                     imgsrc:  "jabber.png",
                     imgalt:  "Jabber/XMPP"
                    };
          break;
        }
        var elt = SPAN({className: "delete-button"},
                       UL({className: "service"},
                          LI(IMG({src: service.imgsrc, alt: service.imgalt})),
                          LI(SPAN({className: "account-jid"},
                             account.name.toString() + "@" + account.domain.toString()),
                             SPAN("/" + account.resource.toString())),
                          LI(service.imgalt)));
        Event.observe(elt, "click", (function(id) {
          return function(e) {
            Musubi.send(<musubi type="set">
                          <deleteitem>
                            <account id={id}/>
                          </deleteitem>
                        </musubi>);
          };
        })(account.@id.toString()));
        df.appendChild(LI(elt));
      }
      eltAccounts.appendChild(df);
    } else if (xml.@type == "result" && xml.deleteitem.length()) {
      if (xml.deleteitem.account.length()) {
        sendRequestAccounts();
      }
    }
    break;
  }
}

function sendRequestAccounts() {
  Musubi.send(<musubi type="get">
                <accounts/>
              </musubi>);
}

function recvTest0() {
  recv(<musubi type="result">
         <accounts>
           <account id="3">
             <name>romeo</name>
             <domain>localhost</domain>
             <resource>Musubi</resource>
             <jid>romeo@localhost</jid>
             <connectionHost>localhost</connectionHost>
             <connectionPort>5223</connectionPort>
             <connectionSecurity>0</connectionSecurity>
             <comment></comment>
           </account>
           <account id="4">
             <name>teruakigemma</name>
             <domain>gmail</domain>
             <resource>Musubi</resource>
             <jid>teruakigemma@gmail</jid>
             <connectionHost>talk.google.com</connectionHost>
             <connectionPort>443</connectionPort>
             <connectionSecurity>1</connectionSecurity>
             <comment></comment>
           </account>
         </accounts>
       </musubi>);
}

Event.observe(window, "load", function (evt) {
  Builder.dump(window);
  Musubi.init();
  Musubi.onRecv = recv;
  sendRequestAccounts();
});
