var nsBuy = new Namespace("musubi:shopping");

function appendPlayerMessage(aMessage) {
  var li = new Element("li");
  li.appendChild(document.createTextNode(aMessage));
  $("player-message-history").appendChild(li);
}

function appendPlayerItem(aItemName) {
  var li = new Element("li");
  li.appendChild(document.createTextNode(aItemName));
  $("player-items").appendChild(li);
}

function appendMasterMessage(aMessage) {
  $("master-message").innerHTML = aMessage;
}

function playerBuy(aItemName) {
  Musubi.send(<message type="chat">
                <body>{"I wanna buy a " + aItemName}</body>
                <buy type="get" xmlns="musubi:shopping">{aItemName}</buy>
                <x xmlns="jabber:x:oob">
                  <url>{Musubi.location.href.replace(/[^/]*$/,"") + "master.html"}</url>
                  <desc>Shop</desc>
                </x>);
              </message>);
  appendPlayerMessage("I wanna buy a " + aItemName);
}

function playerSay(e) {
  Event.stop(e);
  var input = $("player-message-body");
  if (!input.value) return;
  Musubi.send(<message type="chat">
                <body>{input.value}</body>
                <x xmlns="jabber:x:oob">
                  <url>{Musubi.location.href.replace(/[^/]*$/,"") + "master.html"}</url>
                  <desc>Shop</desc>
                </x>);
              </message>);
  appendPlayerMessage(input.value);
  input.value = "";
}

function recv(xml) {
  if (xml.name().localName != "message") return;
  if (xml.body.length()) {
    appendMasterMessage(xml.body.toString());
  }
  if (xml.nsBuy::buy.length()) {
    switch(xml.nsBuy::buy.@type.toString()) {
    case "result":
      appendPlayerItem(xml.nsBuy::buy.toString());
      appendPlayerMessage("You bought a " + xml.nsBuy::buy.toString());
      break;
    case "error":
      appendPlayerMessage("Shopkeeper declined you to buy a " + xml.nsBuy::buy.toString());
      break;
    }
  }
}

function main(e) {
  Musubi.init(recv);
  if (Musubi.location.info) {
    Musubi.send(<message>
                  <body>{Musubi.location.info.auth + " has come in"}</body>
                  <x xmlns="jabber:x:oob">
                    <url>{Musubi.location.href.replace(/[^/]*$/,"") + "master.html"}</url>
                    <desc>Shop</desc>
                  </x>);
                </message>);
  }
  Event.observe($("player-message"), "submit", playerSay);
}

function recvTest0() {
  recv(<message>
         <body>Hi</body>
       </message>);
}

function recvTest1() {
  recv(<message>
         <buy xmlns="musubi:shopping" type="result">cypress stick</buy>
       </message>);
}

function recvTest2() {
  recv(<message>
         <body>Thank you.</body>
         <buy xmlns="musubi:shopping" type="result">plain clothes</buy>
       </message>);
}

Event.observe(window, "load", main);
