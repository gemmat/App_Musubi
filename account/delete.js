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
        var p = Musubi.parseJID(account.barejid.toString());
        var service = {};
        switch (p.host) {
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
                          LI(SPAN(account.barejid + "/" + account.resource)),
                          LI(service.imgalt)));
        Event.observe(elt, "click", (function(barejid) {
          return function(e) {
            Musubi.send(<musubi type="set">
                          <deleteitem>
                            <account>
                              <barejid>{barejid}</barejid>
                            </account>
                          </deleteitem>
                        </musubi>);
          };
        })(account.barejid.toString()));
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
           <account>
             <barejid>romeo@localhost</barejid>
             <resource>Musubi</resource>
             <connectionHost>localhost</connectionHost>
             <connectionPort>5223</connectionPort>
             <connectionScrty>0</connectionScrty>
             <comment></comment>
           </account>
           <account>
             <barejid>teruakigemma@gmail</barejid>
             <resource></resource>
             <connectionHost>talk.google.com</connectionHost>
             <connectionPort>443</connectionPort>
             <connectionScrty>1</connectionScrty>
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
