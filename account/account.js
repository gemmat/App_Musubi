function recv(xml) {
  switch (xml.name().localName) {
  case "message":
    break;
  case "musubi":
    if (xml.accounts.length() && xml.accounts.@type == "result") {
      var df = document.createDocumentFragment();
      for (var i = 0; i < xml.accounts.account.length(); i++) {
        var account = xml.accounts.account[i];
        var service = "";
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
        var li = new Element("li");
        var a = new Element("a", {href: service.href + "?id=" + account.@id});
        var ul = new Element("ul", {className: "service"});
        var liImg = new Element("li");
        var img = new Element("img", {src: service.imgsrc,
                                      alt: service.imgalt});
        var liName = new Element("li").update(account.name.toString() +
                                              "@" +
                                              account.domain.toString() +
                                              "/" +
                                              account.resource.toString());
        var liCap  = new Element("li").update(service.imgalt);
        liImg.appendChild(img);
        ul.appendChild(liImg);
        ul.appendChild(liName);
        ul.appendChild(liCap);
        a.appendChild(ul);
        li.appendChild(a);
        df.appendChild(li);
      }
      $("accounts").appendChild(df);
    }
    break;
  }
}

function sendRequestAccounts() {
  Musubi.send(<musubi>
                <accounts type="get"/>
              </musubi>);
}

function recvTest0() {
  recv(<musubi>
         <accounts type="result">
           <account id="3">
             <name>juliet</name>
             <domain>localhost</domain>
             <resource>Musubi</resource>
             <jid>romeo@localhost</jid>
             <connectionHost>localhost</connectionHost>
             <connectionPort>5223</connectionPort>
             <connectionSecurity>0</connectionSecurity>
             <comment></comment>
           </account>
           <account id="4">
             <name>juliet</name>
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
  Musubi.init();
  Musubi.onRecv = recv;
  sendRequestAccounts();
});
