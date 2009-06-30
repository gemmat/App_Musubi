var canvas = "canvas element";
var c = "canvas context";

function getPos(e) {
  var elt = e.element();
  var m = {left: 0, top: 0};
  if (elt.getBoundingClientRect) {
    m = elt.getBoundingClientRect();
  }
  return {x: m.left, y: m.top};
}

function getXY(e) {
  //gets mouse position relative to object o
  var m0 = e.pointer();
  var m1 = getPos(e);
  var b = document.body;
  return {x: m0.x - m1.x - b.scrollLeft,
          y: m0.y - m1.y - b.scrollTop};
}

function cMove(e) {
  Tool.move(e);
}

function cDown(e) {
  Tool.down(e);
}

function cUp(e) {
  Tool.up(e);
}

function cOut(e) {
  Tool.out(e);
}

var Brushes = Class.create({
  initialize: function() {
    this.last   = null;
    this.cp     = null;
    this.lastcp = null;
    this.sstart = null;
    this.status = 0;
    this.discon = false;
  },
  move: function(e) {
    if (this.status == 0) return;
    var m = getXY(e);
    if (this.discon) { //re-entering canvas: dont draw a line
	    this.discon = false;
	    this.last   = m;
    } else { //draw connecting line
	    this.draw(e);
    }
    c.moveTo(m.x, m.y);
  },
  down: function(e) {
    this.last   = null;
    this.cp     = null;
    this.lastcp = null;
    this.sstart = this.last = getXY(e);
    this.status = 1;
    this.discon = false;
    c.beginPath();
  },
  up: function(e) {
    var m = getXY(e);
    if(this.sstart && this.sstart.x == m.x && this.sstart.y == m.y) {
	    drawDot(m.x, m.y, c.lineWidth, c.strokeStyle);
    }
    this.sstart = null;
    this.status = 0;
    c.closePath();
  },
  out: function(e) {
    if (this.status == 1) {
      this.discon = true;
      this.draw(e);
    }
  },
  draw: function(e) {
    var m = getXY(e);
    //calculate control point
    this.cp = {x: m.x, y: m.y}; //default: no bezier
    var delta = {x: Math.abs(m.x - this.last.x),
	               y: Math.abs(m.y - this.last.y)};
    if(this.last && (delta.x + delta.y > 10)) { //long line
	    //had no control point last time: use last vertex
	    var l = (this.lastcp) ? this.lastcp : this.last;
	    var delta2 = {x: this.last.x - l.x,
		                y: this.last.y - l.y};
 	    this.cp = {x: l.x + delta2.x * 1.4,
		             y: l.y + delta2.y * 1.4};
    }
    this.lastcp = {x: this.cp.x, y: this.cp.y};
    c.bezierCurveTo(this.cp.x, this.cp.y, m.x, m.y, m.x, m.y);  //make pretty curve, first two params =control pt
    c.closePath();
    c.stroke();
    c.beginPath();
    this.last = {x: m.x, y: m.y};
  }
});

var brush = new Brushes();
var Tool = brush;

var Stamp = Class.create({
  initialize: function() {
    this.img = null;
    this.type = 0;
  },
  move: function(e) {
    var cursorChar = $("cursorChar");
    if (cursorChar.hasClassName("hidden"))
      cursorChar.removeClassName("hidden");
    var m = e.pointer();
    cursorChar.style.left = m.x - 16;
    cursorChar.style.top  = m.y - 16;
  },
  down: function(e) {
    this.draw(e);
  },
  up: function(e) {
  },
  out: function(e) {
    var cursorChar = $("cursorChar");
    if (!(cursorChar.hasClassName("hidden")))
      cursorChar.addClassName("hidden");
  },
  draw: function(e) {
    var m = getXY(e);
    if (this.type == 0) {
      c.drawImage(this.img, m.x - 20, m.y - 20, 16,16);
    } else {
      c.drawImage(this.img, m.x - 20, m.y - 20, 240,11);
    }
  }
});

var stamp = new Stamp();

function drawDot(x, y, size, col, trg) {
  x = Math.floor(x) + 1; //prevent antialiasing of 1px dots
  y = Math.floor(y) + 1;
  if(x > 0 && y > 0) {
    var lastcol, lastsize;
    if(!trg) trg = c;
    if(col || size) {
      lastcol = trg.fillStyle;
      lastsize = trg.lineWidth;
    }
    if(col)  trg.fillStyle = col;
    if(size) trg.lineWidth = size;
    if(trg.lineCap == "round") {
      trg.arc(x, y, trg.lineWidth / 2, 0, 2 * Math.PI, false);
      trg.fill();
    } else {
      var dotoffset = (trg.lineWidth > 1) ? trg.lineWidth / 2 : trg.lineWidth;
      trg.fillRect((x - dotoffset), (y - dotoffset), trg.lineWidth, trg.lineWidth);
    }
    if(col || size) {
      trg.fillStyle = lastcol;
      trg.lineWidth = lastsize;
    }
  }
}

function toggleSelected(elt) {
  $$("img.selected").forEach(function(x) {
    x.removeClassName("selected");});
  elt.addClassName("selected");
}

function main() {
  canvas = $("canvas");
  c = canvas.getContext("2d");
  canvas.observe("mousemove", cMove);
  canvas.observe("mousedown", cDown);
  canvas.observe("mouseup", cUp);
  canvas.observe("mouseout", cOut);
  $("cursorChar").observe("mousemove", cMove);
  $("pencil").addClassName("selected");
  $("pencil") .observe("click", function(e) {
                         c.lineWidth   = 1;
                         c.fillStyle   = "#000000";
                         c.strokeStyle = "#000000";
                         Tool = brush;
                         toggleSelected(e.element());
                       });
  $("pencil2").observe("click", function(e) {
                         c.lineWidth   = 3;
                         c.fillStyle   = "#000000";
                         c.strokeStyle = "#000000";
                         Tool = brush;
                         toggleSelected(e.element());
                       });
  $("eraser") .observe("click", function(e) {
                         c.lineWidth   = 9;
                         c.fillStyle   = "#FFFFFF";
                         c.strokeStyle = "#FFFFFF";
                         Tool = brush;
                         toggleSelected(e.element());
                       });
  $("stampText").observe("click", function(e) {
                         var ct   = $("canvasText");
                         var ctxt = ct.getContext("2d");
                         ctxt.clearRect(0,0,240,160);
                         ctxt.save();
                         ctxt.translate(0, 10);
                         ctxt.mozTextStyle = "10pt sans serif";
                         ctxt.fillStyle = "#000000";
                         ctxt.mozDrawText($("texter").value);
                         ctxt.restore();
                         $("cursorChar").src = ct.toDataURL();
                         stamp.type = 1;
                         stamp.img = ct;
                         Tool = stamp;
                         toggleSelected(e.element());
                       });
  $$("img.char_aZ").forEach(function(x) {
    x.observe("click", function(e) {
      stamp.type = 0;
      Tool = stamp;
      $$("img.char_aZ.selected").forEach(function(y) {
        y.removeClassName("selected");
      });
      $("cursorChar").src = e.element().src;
      stamp.img = e.element();
      toggleSelected(e.element());
    });
  });
  $("commandClear").observe("click", function(e) {c.clearRect(0,0,240,160);});
  $("commandSend").observe("click",commandSend);
  $("commandLoad").observe("click",commandLoad);
  $("commandChat").observe("submit",function(e) {
                             commandChat();
                             e.stop();
                             return false;
                           });
  Musubi.init();
  Musubi.onRecv = recv;
}

function recv(xml) {
  var elt = $("history");
  var from = xml.@from.toString().match(/([^@]+)@/)[1];
  var xhtml_im = new Namespace("http://jabber.org/protocol/xhtml-im");
  var xhtml = new Namespace("http://www.w3.org/1999/xhtml");
  var img_src = xml.xhtml_im::html..xhtml::img.@src;
  if (img_src != undefined) {
    var p   = new Element("p",  {className: "msg"}).update(from + ":");
    var img = new Element("img",{className: "msg", src: img_src.toString()});
    img.observe("load",function(e) {elt.scrollTop = elt.scrollHeight;});
    elt.appendChild(p);
    elt.appendChild(img);
  } else {
    var p = new Element("p",{className: "msg"}).update(from + ":" + xml.body.toString());
    elt.appendChild(p);
  }
}

function commandChat() {
  var value = $F("texter");
  Musubi.send(<message type="chat">
                <body>{value}</body>
              </message>);
  var elt = $("history");
  elt.appendChild(new Element("p",{className: "msg"}).update("me" + ":" + value));
  elt.scrollTop = elt.scrollHeight;
}

function commandSend(e) {
  var dataurl = canvas.toDataURL();
  Musubi.send(<message type="chat">
                <body>This message contains xhtml-im. Please use the Musubi.</body>
                <html xmlns="http://jabber.org/protocol/xhtml-im">
                  <body xmlns="http://www.w3.org/1999/xhtml">
                    <img src={dataurl} alt="Canvas Chat image"/>
                  </body>
                </html>
              </message>);
  var elt = $("history");
  var img = new Element("img",{className: "msg", src: dataurl});
  img.observe("load",function(e) {elt.scrollTop = elt.scrollHeight;});
  elt.appendChild(new Element("p").update("you:"));
  elt.appendChild(img);
}

function commandLoad(e) {
  var imgs = $$("#history img.msg").slice(-1);
  if (imgs.length == 1) {
    c.clearRect(0,0,240,160);
    c.drawImage(imgs[0],0,0);
  }
}
