var ctx = null;
var g = null;
const cnvWidth  = 320;
const cnvHeight = 240;

function draw() {
  ctx.drawImage(g, 0, 0, 1, 1);
}

function init() {
  ctx = $("cnv").getContext("2d");

  // y 1|
  //    |
  //    |
  //    O----
  //(0,0)   1
  //        x

  ctx.setTransform(1, 0, 0, -1, 0, cnvHeight);
  ctx.scale(cnvWidth, cnvHeight);
  g = $("gauche");
}

function appendMessage(aFrom, aMessage) {
  var dt = new Element("dt").update(aFrom);
  var dd = new Element("dd").update(aMessage);
  var script = new Element("script").update(aMessage);
  dd.appendChild(script);
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
  appendMessage(xml.@from.toString(),
                xml.body.toString());
}

Event.observe(window, "load", function(e) {
  Musubi.init(recv);
  init();
});


