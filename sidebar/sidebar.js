function appendMessage(aFrom, aMessage) {
  var dt  = new Element("dt");
  var img = new Element("img", {src: "romeo.png", alt: aFrom, title: aFrom});
  dt.appendChild(img);
  dt.appendChild(document.createTextNode(aFrom));
  var dd = new Element("dd").update(aMessage);
  var history = $("history");
  history.appendChild(dt);
  history.appendChild(dd);
}

function appendURLMessage(aFrom, aURL, aMessage) {
  var dt = new Element("dt");
  var dd = new Element("dd");
  var a  = new Element("a", {href: aURL}).update(aMessage);
  Event.observe(a, "click", function(e) {
                  openMsgURL(e, aFrom, aURL, aMessage);
                });
  dd.appendChild(a);
  var history = $("history");
  history.appendChild(dt);
  history.appendChild(dd);
}

function appendXHTMLMessage(aFrom, aMessage) {
  var dt = new Element("dt");
  var dd = new Element("dd").update(aMessage);
  var history = $("history");
  history.appendChild(dt);
  history.appendChild(dd);
}

function send() {
  var xml = <message type="chat">
	            <body>{$F("msg")}</body>
            </message>;
  Musubi.send(xml);
  appendMessage("me", $F("msg"));
  Field.clear("msg");
  return false;
}

function recv(xml) {
  switch (xml.name().localName) {
  case "message":
    appendMessage(xml.@from.toString(),
                  xml.body.toString());
    var nsJabberXOOB = new Namespace("jabber:x:oob");
    if (xml.nsJabberXOOB::x.nsJabberXOOB::url.length()) {
      appendURLMessage(xml.@from.toString(),
                       xml.nsJabberXOOB::x.nsJabberXOOB::url.toString(),
                       xml.nsJabberXOOB::x.nsJabberXOOB::desc.toString());
    }
    var nsXHTMLIm = new Namespace("http://jabber.org/protocol/xhtml-im");
    var nsXHTML   = new Namespace("http://www.w3.org/1999/xhtml");
    if (xml.nsXHTMLIm::html.nsXHTML::body.length()) {
      appendXHTMLMessage(xml.@from.toString(),
                         xml.nsXHTMLIm::html.nsXHTML::body.toString());
    }
    break;
  case "musubi":
    break;
  }
  var historyContainer = $("history-container");
  historyContainer.scrollTop = historyContainer.scrollHeight;
}

function recvTest0() {
  var from = "romeo@localhost";
  var body = "hello, world.";
  recv(<message from={from}>
         <body>{body}</body>
       </message>);
}

function recvTest1() {
  var from = "romeo@localhost";
  var url  = "http://www.google.co.jp";
  var desc = "Google";
  recv(<message from={from}>
         <body>hello world</body>
         <x xmlns="jabber:x:oob">
           <url>{url}</url>
           <desc>{desc}</desc>
         </x>
       </message>);
}

function recvTest2() {
  var from = "romeo@localhost";
  var url  = "http://www.google.co.jp";
  var desc = "Google";
  recv(<message from={from}>
         <body>hello world</body>
         <html xmlns='http://jabber.org/protocol/xhtml-im'>
           <body xmlns='http://www.w3.org/1999/xhtml'>
             <p style='font-weight:bold'>hi!</p>
           </body>
         </html>
       </message>);
}


function connect() {
  Musubi.send(<musubi><connect></connect></musubi>);
}

function disconnect() {
  Musubi.send(<musubi><disconnect></disconnect></musubi>);
}

function openMsgURL(evt, aFrom, aURL, aMessage) {
  Musubi.send(<musubi>
                 <urlmsg>
                   <from>{aFrom}</from>
                   <url>{aURL}</url>
                   <desc>{aMessage}</desc>
                 </urlmsg>
               </musubi>);
  Event.stop(evt);
}

function openMsgSender(evt) {
  Musubi.send(<musubi>
                 <sender>{evt.target.innerHTML}</sender>
               </musubi>);
  Event.stop(evt);
}

window.onload = function windowOnLoad() {
  Musubi.init();
  Musubi.onRecv = recv;
};
