function recv(xml) {
  switch (xml.name().localName) {
  case "message":
    break;
  case "musubi":
    if (xml.@type == "result" && xml.accounts.length()) {
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
        var imgDefaultJID = IMG({src: "homeGray.png", className: "account-set-defaultjid"});
        Event.observe(imgDefaultJID, "click", (function(jid) {
          return function(e) {
            Musubi.send(<musubi type="set">
                          <defaultjid>{jid}</defaultjid>
                        </musubi>);
          };
        })(account.barejid.toString()));
        df.appendChild(
          LI(A({href: service.href + "?id=" + account.@id},
               UL({className: "service"},
                  LI(IMG({src: service.imgsrc, alt: service.imgalt})),
                  LI(SPAN({className: "account-jid"}, account.barejid.toString()),
                     SPAN("/" + account.resource.toString())),
                  LI(service.imgalt))),
             imgDefaultJID));

      }
       $("accounts").appendChild(df);
    }
    if (xml.@type == "result" && xml.defaultjid.length()) {
      $$("span.account-jid").forEach(function(x) {
        var li = x.up(3);
        var img = li.down(8);
        if (li.hasClassName("default-jid")) {
          li.removeClassName("default-jid");
          img.src = "homeGray.png";
        }
        if (x.textContent == xml.defaultjid.toString()) {
          li.addClassName("default-jid");
          img.src = "home.png";
        }
      });
    }
    break;
  }
}

function recvTest0() {
  recv(<musubi type="result">
         <accounts>
           <account id="3">
             <name>romeo</name>
             <domain>localhost</domain>
             <resource>Musubi</resource>
             <barejid>romeo@localhost</barejid>
             <fulljid>romeo@localhost/Musubi</fulljid>
             <connectionHost>localhost</connectionHost>
             <connectionPort>5223</connectionPort>
             <connectionScrty>0</connectionScrty>
             <comment></comment>
           </account>
           <account id="4">
             <name>teruakigemma</name>
             <domain>gmail</domain>
             <resource></resource>
             <barejid>teruakigemma@gmail</barejid>
             <fulljid>teruakigemma@gmail/</fulljid>
             <connectionHost>talk.google.com</connectionHost>
             <connectionPort>443</connectionPort>
             <connectionScrty>1</connectionScrty>
             <comment></comment>
           </account>
         </accounts>
       </musubi>);
}

function recvTest1() {
  recv(<musubi type="result">
         <defaultjid>romeo@localhost</defaultjid>
       </musubi>);
}

Event.observe(window, "load", function (evt) {
  Builder.dump(window);
  Musubi.init();
  Musubi.onRecv = recv;
  Musubi.send(<musubi type="get">
                <accounts/>
              </musubi>);
  Musubi.send(<musubi type="get">
                <defaultjid/>
              </musubi>);
});
