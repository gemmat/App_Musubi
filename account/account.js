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
        var p = Musubi.parseJID(account.barejid.toString());
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
        var imgDefaultAccount = IMG({src: "homeGray.png", className: "account-set-defaultAccount"});
        Event.observe(imgDefaultAccount, "click", (function(barejid) {
          return function(e) {
            sendSetDefaultAccount(barejid);
          };
        })(account.barejid.toString()));
        df.appendChild(
          LI(A({href: service.href + "?barejid=" + account.barejid.toString()},
               UL({className: "service"},
                  LI(IMG({src: service.imgsrc, alt: service.imgalt})),
                  LI(SPAN({className: "account-jid"}, account.barejid.toString())),
                  LI(service.imgalt))),
             imgDefaultAccount));

      }
      $("accounts").appendChild(df);
    }
    if (xml.@type == "result" && xml.defaultaccount.length()) {
      $$("span.account-jid").forEach(function(x) {
        var li = x.up(3);
        var img = li.down(7);
        if (li.hasClassName("default-account")) {
          li.removeClassName("default-account");
          img.src = "homeGray.png";
        }
        if (x.textContent == xml.defaultaccount.toString()) {
          li.addClassName("default-account");
          img.src = "home.png";
        }
      });
    }
    break;
  }
}

Event.observe(window, "load", function (evt) {
  Builder.dump(window);
  Musubi.init();
  Musubi.onRecv = recv;
  sendReadAllAccount();
  sendGetDefaultAccount();
});
