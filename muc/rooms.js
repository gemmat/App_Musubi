// We need account's binded jid by the server.
var bindedJID = "";

function sendIQGetInfo() {
  var xml = <iq id="info1" type="get">
              <query xmlns="http://jabber.org/protocol/disco#info"/>
            </iq>;
  Musubi.send(xml);
}

function sendIQGetRooms() {
  if (!bindedJID) return;
  var xml = <iq from={bindedJID} id="disco2" type="get">
              <query xmlns="http://jabber.org/protocol/disco#items"/>
            </iq>;
  Musubi.send(xml);
}

function recv(xml) {
  var nsDiscoInfo  = new Namespace("http://jabber.org/protocol/disco#info");
  var nsDiscoItems = new Namespace("http://jabber.org/protocol/disco#items");
  if (xml.name().localName == "iq") {
    if (xml.@id   == "info1"  &&
        xml.@type == "result") {
      bindedJID = xml.@to.toString();
      sendIQGetRooms();
    }
    if (xml.@id   == "disco2" &&
        xml.@type == "result") {
      var df = document.createDocumentFragment();
      var items = xml.nsDiscoItems::query.nsDiscoItems::item;
      for (var i = 0, len = items.length(); i < len; i++) {
        var li = new Element("li");
        var a  = new Element("a", {href: "xmpp:" + items[i].@jid + "#muc.html?room=" + encodeURI(items[i].@name)}).update(items[i].@name.toString());
        li.appendChild(a);
        df.appendChild(li);
      }
      $("rooms").appendChild(df);
      return;
    }
  }
}

function recvTest0() {
  recv(<iq from="conference.jabber.org" to="teruakigemma@gmail.com/MusubiF4220E2B" id="info1" type="result">
       <query xmlns="http://jabber.org/protocol/disco#info">
       <identity category="conference" type="text" name="Chatrooms"/>
       <feature var="http://jabber.org/protocol/muc"/>
       <feature var="jabber:iq:register"/>
       <feature var="vcard-temp"/>
       </query>
       <meta account="teruakigemma@gmail.com/Musubi" direction="in" xmlns="http://hyperstruct.net/xmpp4moz/protocol/internal"/>
       </iq>);
}

function recvTest0() {
  recv(<iq from="conference.jabber.org" to="teruakigemma@gmail.com/4CA4DE67" id="disco2" type="result">
       <query xmlns="http://jabber.org/protocol/disco#items">
       <item jid="retreatnumberfive@conference.jabber.org" name="Retreat Number Five (n/a)"/>
       <item jid="jepara@conference.jabber.org" name="acha's room...don't be noisy (n/a)"/>
       <item jid="cobalt@conference.jabber.org" name="Cobalt (3)"/>
       <item jid="circleoftheimbolcmoon@conference.jabber.org" name="circleoftheimbolcmoon (1)"/>
       <item jid="bots@conference.jabber.org" name="Jabber Bots (1)"/>
       <item jid="citynov@conference.jabber.org" name="citynov (1)"/>
       <item jid="banda@conference.jabber.org" name="banda (n/a)"/>
       <item jid="bright@conference.jabber.org" name="bright (2)"/>
       <item jid="minimal@conference.jabber.org" name="minimal music (1)"/>
       <item jid="meebomeebochat284@conference.jabber.org" name="meebomeebochat284 (n/a)"/>
       <item jid="se-developers@conference.jabber.org" name="Se-Developers (n/a)"/>
       <item jid="northscalers@conference.jabber.org" name="northscalers (n/a)"/>
       <item jid="esperanto@conference.jabber.org" name="Esperanto - La internacia Lingvo (n/a)"/>
       <item jid="mediasourcery@conference.jabber.org" name="mediasourcery (n/a)"/>
       <item jid="usa@conference.jabber.org" name="Under the Same Atmosphere, have a nice chat.. (n/a)"/>
       <item jid="gichko@conference.jabber.org" name="Gichko VII (n/a)"/>
       <item jid="mc-dev@conference.jabber.org" name="mc-dev (5)"/>
       <item jid="corrupted-idiots@conference.jabber.org" name="corrupted-idiots (n/a)"/>
       <item jid="minsk.industrial@conference.jabber.org" name="Minsk Industrial (1)"/>
       <item jid="test@conference.jabber.org" name="test (1)"/>
       </query>
       <meta account="teruakigemma@gmail.com/" direction="in" xmlns="http://hyperstruct.net/xmpp4moz/protocol/internal"/>
       </iq>);
}

function main() {
  Musubi.init(recv);
  Event.observe($("form-create-room"), "submit", function(e) {
    var room = $("room").value;
    if (room && Musubi.location.info) {
      var q = Musubi.parseJID(Musubi.location.info.path);
      if (q) {
        document.location.href = "xmpp:" + room.toLowerCase() + "@" + q.domain + "#muc.html?create";
      }
    }
    Event.stop(e);
  });
  sendIQGetInfo();
}

window.onload = main;