var cnv;      //canvas element
var ctx;      //canvas context
var smallcnv; //small canvas element
var smallctx; //small canvas context
var cnvWidth   = 640;
var cnvHeight  = 480;
var cnvWidthS  = 320;
var cnvHeightS = 240;
var chattype = "chat";
var stampURL = "http://sites.google.com/site/musubichat/whiteboard/";

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
  cursor.move(e);
}

function cDown(e) {
  Tool.down(e);
}

function cUp(e) {
  Tool.up(e);
}

function cOut(e) {
  Tool.out(e);
  cursor.out(e);
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
    ctx.moveTo(m.x, m.y);
  },
  down: function(e) {
    this.last   = null;
    this.cp     = null;
    this.lastcp = null;
    this.sstart = this.last = getXY(e);
    this.status = 1;
    this.discon = false;
    ctx.beginPath();
  },
  up: function(e) {
    var m = getXY(e);
    if(this.sstart && this.sstart.x == m.x && this.sstart.y == m.y) {
	    drawDot(m.x, m.y, ctx.lineWidth, ctx.strokeStyle);
    }
    this.sstart = null;
    this.status = 0;
    ctx.closePath();
    sendCanvas();
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
    ctx.bezierCurveTo(this.cp.x, this.cp.y, m.x, m.y, m.x, m.y);  //make pretty curve, first two params =control pt
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    this.last = {x: m.x, y: m.y};
  }
});

var Stamp = Class.create({
  initialize: function() {
    this.imgsrc = "";
  },
  move: function(e) {
  },
  down: function(e) {
    this.draw(e);
  },
  up: function(e) {
  },
  out: function(e) {
  },
  draw: function(e) {
    var m = getXY(e);
    sendStamp(this.imgsrc, m.x, m.y);
  }
});

var Cursor = Class.create({
  initialize: function(aImg) {
    this.img = aImg;
    this.status = false;
  },
  move: function(e) {
    var m = e.pointer();
    if (!this.status) {
      this.img.style.display = "";
      this.status = true;
    }
    this.img.style.left = m.x;
    this.img.style.top  = m.y;
  },
  out: function(e) {
    this.img.style.display = "none";
    this.status = false;
  }
});

var brush;
var stamp;
var cursor;
var Tool;

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
  var imgsrc   = xml.nsXhtmlIm::html..nsXhtml::img.@src;
  var imgstyle = xml.nsXhtmlIm::html..nsXhtml::img.@style;
  if (imgsrc.length()) {
    var img = null;
    if (imgstyle.length()) {
      img = new Element("img", {className: "canvas-img-stamp", src: imgsrc, style: imgstyle});
    } else {
      img = new Element("img", {className: "canvas-img", src: imgsrc, width: cnvWidth, height: cnvHeight});
    }
    $("canvas-history").appendChild(img);
  }
}

function sendCanvas(e) {
  smallctx.drawImage(cnv, 0, 0, cnvWidthS, cnvHeightS);
  var dataurl = smallcnv.toDataURL();
  var xml = <message type={chattype}>
              <html xmlns="http://jabber.org/protocol/xhtml-im">
                <body xmlns="http://www.w3.org/1999/xhtml">
                  <img src={dataurl}/>
                </body>
              </html>
            </message>;
  clear(e);
  Musubi.send(xml);
  recv(xml);
}

function sendStamp(aImgSrc, aX, aY) {
  var xml = <message type={chattype}>
              <html xmlns="http://jabber.org/protocol/xhtml-im">
                <body xmlns="http://www.w3.org/1999/xhtml">
                  <img src={aImgSrc} style={"position: absolute; left:" + aX + "px; top:" + aY + "px;"}/>
                </body>
              </html>
            </message>;
  Musubi.send(xml);
  recv(xml);
}

function clear(e) {
  smallctx.clearRect(0, 0, cnvWidthS, cnvHeightS);
  ctx.clearRect(0, 0, cnvWidth, cnvHeight);
}

function makeStampImgSrc(aValue) {
  //if aValue is the URL.
  if (/^http:\/\//.test(aValue)) return aValue;
  //if aValue is the Text.
  var ct  = $("canvas-stamp-maker");
  var ctc = ct.getContext("2d");
  ctc.clearRect(0, 0, 240, 30);
  ctc.save();
  ctc.translate(0, 20);
  ctc.mozTextStyle = "20pt sans serif";
  ctc.fillStyle = "#000000";
  ctc.mozDrawText(aValue);
  ctc.restore();
  return ct.toDataURL();
}

function appendStampImgS(aArray) {
  var df = document.createDocumentFragment();
  for (var i = 0, len = aArray.length; i < len; i++) {
    appendStampImg(aArray[i], df);
  }
  $("stamp-history").appendChild(df);
}

function appendStampImg(aValue, aElement) {
  var img = new Element("img", {src: makeStampImgSrc(aValue),
                                className: "stamp-img"});
  img.observe("click", onClickStampImg);
  var li = new Element("li");
  li.appendChild(img);
  if (aElement.firstChild) {
    aElement.insertBefore(li, aElement.firstChild);
  } else {
    aElement.appendChild(li);
  }
}

function onSubmitStampMaker(e) {
  var elt = $("stamp-maker-src");
  appendStampImg(elt.value, $("stamp-history"));
  Event.stop(e);
}

function onClickStampImg(e) {
  stamp.imgsrc = e.target.src;
  cursor.img.src = e.target.src;
  Tool = stamp;
}

function onClickBrush(e) {
  ctx.lineWidth   = 1;
  ctx.strokeStyle = "#000000";
  Tool = brush;
  cursor.img.src = $("brush").src;
}

function onClickEraser(e) {
  ctx.lineWidth   = 12;
  ctx.strokeStyle = "#FFFFFF";
  Tool = brush;
  cursor.img.src = $("eraser").src;
}

function onClickNewCanvas(e) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, cnvWidth, cnvHeight);
  sendCanvas(e);
}

function main() {
  Musubi.init(recv);
  cnv = $("canvas");
  ctx= cnv.getContext("2d");
  smallcnv = $("small");
  smallctx = smallcnv.getContext("2d");
  brush  = new Brushes();
  stamp  = new Stamp();
  cursor = new Cursor($("cursor-image"));
  Tool = brush;
  cnv.observe("mousemove", cMove);
  cnv.observe("mousedown", cDown);
  cnv.observe("mouseup",   cUp);
  cnv.observe("mouseout",  cOut);
  $("brush") .observe("click", onClickBrush);
  $("eraser").observe("click", onClickEraser);
  $("newcnv").observe("click", onClickNewCanvas);
  $("stamp-maker").observe("submit", onSubmitStampMaker);
  // absolute the URI of imgs' src.
  appendStampImgS([stampURL + "char_9728.png",
                   stampURL + "char_9729.png",
                   stampURL + "char_9730.png",
                   stampURL + "char_9731.png",
                   stampURL + "char_9733.png",
                   stampURL + "char_9734.png",
                   stampURL + "char_9749.png",
                   stampURL + "char_9752.png",
                   stampURL + "char_9760.png",
                   stampURL + "char_9762.png",
                   stampURL + "char_9785.png",
                   stampURL + "char_9786.png",
                   stampURL + "char_9792.png",
                   stampURL + "char_9794.png",
                   stampURL + "char_9816.png",
                   stampURL + "char_9833.png",
                   stampURL + "char_9834.png",
                   stampURL + "char_9835.png"]);
}

Event.observe(window, "load", main);