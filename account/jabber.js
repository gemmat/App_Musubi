function recv(xml) {
  switch (xml.name().localName) {
  case "message":
    break;
  case "musubi":
    if (xml.@type == "result" && xml.account.length()) {
      if (xml.account.*.length()) {
        var a = xml.account;
        var p = Musubi.parseJID(a.barejid.toString());
        $("username")           .value = p.name;
        $("domain")             .value = p.host;
        $("resource")           .value = a.resource          .toString();
        $("connection-host")    .value = a.connectionHost    .toString();
        $("connection-port")    .value = a.connectionPort    .toString();
        if (a.connectionScrty.toString() == "0") {
          $("connection-scrty-none").checked = true;
        } else if (a.connectionScrty.toString() == "1") {
          $("connection-scrty-ssl").checked = true;
        }
      } else {
        document.location.href = "account.html";
      }
    }
  }
}

Event.observe(window, "load", function (evt) {
  Musubi.init();
  Musubi.onRecv = recv;
  var m = /^\?barejid=(.+)/.exec(document.location.search);
  if (m) {
    sendRequestUserInfo(m[1]);
  }
});
