function appendAccount(aBarejid, aResource) {
  var to = aBarejid + "/" + aResource;
  var elt = A({href: "xmpp://" + aBarejid + "/" + to + "?share;href=sidebar2.html"}, to);
  Event.observe(elt, "click", function(e) {
    connect(e.target.textContent);
    //TODO Event.stop(e) and wait the connection is to be online.
  });
  $("accounts").appendChild(LI(elt));
}

function recv(xml) {
  switch (xml.name().localName) {
  case "musubi":
    if (xml.@type == "result" && xml.accounts.length()) {
      for (var i = 0, len = xml.accounts.account.length(); i < len; i++) {
        appendAccount(xml.accounts.account[i].barejid.toString(),
                      xml.accounts.account[i].resource.toString());
      }
    }
    break;
  }
}

function connect(aAccount) {
  Musubi.send(<musubi type="set"><connect>{aAccount}</connect></musubi>);
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
