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
            sendDeleteAccount(barejid);
          };
        })(account.barejid.toString()));
        df.appendChild(LI(elt));
      }
      eltAccounts.appendChild(df);
    } else if (xml.@type == "result" && xml.account.length()) {
      if (xml.account.@del.length()) {
        sendReadAllAccount();
      }
    }
    break;
  }
}

Event.observe(window, "load", function (evt) {
  Builder.dump(window);
  Musubi.init();
  Musubi.onRecv = recv;
  sendReadAllAccount();
});
