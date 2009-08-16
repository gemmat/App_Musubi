function send() {
  var xml = <iq id="disco2" type="get">
              <query xmlns="http://jabber.org/protocol/disco#items"/>
            </iq>;
  Musubi.send(xml);
}

function recv(xml) {
  var nsDiscoItems = new Namespace("http://jabber.org/protocol/disco#items");
  if (xml.@id   == "disco2" &&
      xml.@type == "result" &&
      xml.nsDiscoItems::query.nsDiscoItems::item.length()) {
    var items = xml.nsDiscoItems::query.nsDiscoItems::item;
    var df = document.createDocumentFragment();
    for (var i = 0, len = items.length(); i < len; i++) {
      var li = new Element("li");
      var a  = new Element("a", {href: "xmpp:" + items[i].@jid.toString() + "?share;href=muc.html"}).update(items[i].@name.toString());
      li.appendChild(a);
      df.appendChild(li);
    }
    $("rooms").appendChild(df);
  }
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
  Musubi.init();
  Musubi.onRecv = recv;
  Event.observe($("form-create-room"), "submit", function(e) {
    var room = $("room").value;
    var m = /^xmpp:\/\/[^\/]+\/([^\/\?@]+)/.exec(document.location.href);
    if (room && m) {
      document.location.href = "xmpp:" + room + "@" + m[1] + "?share;href=muc.html?create";
    }
    Event.stop(e);
  });
  send();
}

window.onload = main;