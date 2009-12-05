var nsBuy = new Namespace("musubi:shopping");

function appendMessage(aMessage) {
  var li = new Element("li");
  li.appendChild(document.createTextNode(aMessage));
  $("history").appendChild(li);
}

function appendMessageRequestToBuy(aItemName) {
  var li = new Element("li");
  var buttonYes = new Element("button");
  var buttonNo  = new Element("button");
  Event.observe(buttonYes, "click", function(e) {
    Element.remove(buttonYes);
    Element.remove(buttonNo);
    masterAcceptPlayerToBuy(aItemName);
    });
  Event.observe(buttonNo, "click", function(e) {
    Element.remove(buttonYes);
    Element.remove(buttonNo);
    masterDeclinePlayerToBuy(aItemName);
    });
  buttonYes.appendChild(document.createTextNode("yes"));
  buttonNo.appendChild(document.createTextNode("no"));
  li.appendChild(document.createTextNode("Sell a " + aItemName + "?"));
  li.appendChild(buttonYes);
  li.appendChild(buttonNo);
  $("history").appendChild(li);
}

function masterAcceptPlayerToBuy(aItemName) {
  Musubi.send(<message>
                <buy type="result" xmlns="musubi:shopping">{aItemName}</buy>
                <x xmlns="jabber:x:oob">
                  <url>{Musubi.location.href.replace(/[^/]*$/,"") + "player.html"}</url>
                  <desc>Shop</desc>
                </x>);
              </message>);
  appendMessage("You soled a " + aItemName);
}

function masterDeclinePlayerToBuy(aItemName) {
  Musubi.send(<message>
                <buy type="error" xmlns="musubi:shopping">{aItemName}</buy>
                <x xmlns="jabber:x:oob">
                  <url>{Musubi.location.href.replace(/[^/]*$/,"") + "player.html"}</url>
                  <desc>Shop</desc>
                </x>);
              </message>);
  appendMessage("You declined to sell a " + aItemName);
}

function masterSay(e) {
  Event.stop(e);
  var input = $("input");
  if (!input.value) return;
  Musubi.send(<message type="chat">
                <body>{input.value}</body>
                <x xmlns="jabber:x:oob">
                  <url>{Musubi.location.href.replace(/[^/]*$/,"") + "player.html"}</url>
                  <desc>Shop</desc>
                </x>);
              </message>);
  appendMessage(input.value);
  input.value = "";
}

function recv(xml) {
  if (xml.name().localName != "message") return;
  if (xml.body.length()) {
    appendMessage(xml.body.toString());
  }
  if (xml.nsBuy::buy.length()) {
    switch(xml.nsBuy::buy.@type.toString()) {
    case "get":
      appendMessageRequestToBuy(xml.nsBuy::buy.toString());
      break;
    }
  }
}

function main(e) {
  Musubi.init(recv);
  Event.observe($("form"), "submit", masterSay);
}

function recvTest0() {
  recv(<message>
         <body>Hi</body>
       </message>);
}

function recvTest1() {
  recv(<message>
         <body>I wanna buy a Cypress stick</body>
         <buy xmlns="musubi:shopping" type="get">cypress stick</buy>
       </message>);
}

Event.observe(window, "load", main);
