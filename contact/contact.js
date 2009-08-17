function getRosters() {
  Musubi.send(<iq type="get">
                <query xmlns="jabber:iq:roster"/>
              </iq>);
}

function recv(xml) {
  switch (xml.name().localName) {
  case "iq":
    break;
  case "musubi":
    break;
  }
}

function recvTest0() {
  recv(<iq type="result">
         <query xmlns="jabber:iq:roster">
           <item jid="alice@wonderland.lit"/>
           <item jid="queen@wonderland.lit"/>
         </query>
       </iq>);
}

function recvTest1() {
  recv();
}

Event.observe(window, "load", function (evt) {
  Builder.dump(window);
  Musubi.init();
  Musubi.onRecv = recv;
});
