function recv(xml) {
  switch (xml.name().localName) {
  case "message":
    break;
  case "musubi":
    if (xml.@type == "result" && xml.accounts.length()) {
      if (xml.accounts.account.length()) {
        var a = xml.accounts.account[0];
        $("userid")             .value = a.@id               .toString();
        $("username")           .value = a.name              .toString();
        $("domain")             .value = a.domain            .toString();
        $("resource")           .value = a.resource          .toString();
        $("connection-host")    .value = a.connectionHost    .toString();
        $("connection-port")    .value = a.connectionPort    .toString();
        if (a.connectionSecurity.toString() == "0") {
          $("connection-security-none").checked = true;
        } else if (a.connectionSecurity.toString() == "1") {
          $("connection-security-ssl").checked = true;
        }
      }
    } else if (xml.@type == "result" && xml.ok.length()) {
      document.location.href = "account.html";
    }
  }
}

Event.observe(window, "load", function (evt) {
  Musubi.init();
  Musubi.onRecv = recv;
  var m = /^\?id=(.+)/.exec(document.location.search);
  if (m) {
    sendRequestUserInfo(m[1]);
  }
});
