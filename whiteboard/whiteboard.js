var canvas = "canvas element";
var c = "canvas context";
var cnvWidth  = 320;
var cnvHeight = 240;

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

function recv(xml) {
  var nsXhtmlIm = new Namespace("http://jabber.org/protocol/xhtml-im");
  var nsXhtml = new Namespace("http://www.w3.org/1999/xhtml");
  var dataurl = xml.nsXhtmlIm::html..nsXhtml::img.@src;
  if (dataurl.length()) {
    var img = new Element("img", {className: "canvas-img", src: dataurl, width: cnvWidth, height: cnvHeight});
    $("canvas-container").insertBefore(img, canvas);
  }
}

function send(e) {
  var dataurl = canvas.toDataURL();
  var xml = <message type="chat">
              <body></body>
              <html xmlns="http://jabber.org/protocol/xhtml-im">
                <body xmlns="http://www.w3.org/1999/xhtml">
                  <img src={dataurl} width="320" height="240" alt="Canvas Chat image"/>
                </body>
              </html>
            </message>;
  Musubi.send(xml);
  recv(xml);
  clear(e);
}

function clear(e) {
  c.clearRect(0, 0, cnvWidth, cnvHeight);
}

function newboard(e) {
  c.fillRect(0, 0, cnvWidth, cnvHeight);
  send(e);
}

function main() {
  Musubi.init();
  Musubi.onRecv = recv;
  canvas = $("canvas");
  c = canvas.getContext("2d");
  canvas.observe("mousemove", cMove);
  canvas.observe("mousedown", cDown);
  canvas.observe("mouseup",   cUp);
  canvas.observe("mouseout",  cOut);
  c.lineWidth   = 1;
  c.fillStyle   = "#FFFFFF";
  c.strokeStyle = "#000000";
  Tool = brush;
  $("send").observe("click",send);
  $("clear").observe("click", clear);
  $("newboard").observe("click", newboard);
}

Event.observe(window, "load", main);