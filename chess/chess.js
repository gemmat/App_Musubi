var cboard = "";
var moveLen = 0;
var mpoint = 0;
var pi = -1;
var pj = -1;
var cboardHistory = [];
var coding = {
  r:"bR",n:"bN",b:"bB",q:"bQ",k:"bK",p:"bP",
  R:"wR",N:"wN",B:"wB",Q:"wQ",K:"wK",P:"wP"
};

var nsChessboard = new Namespace("http://musubi.im/chess");

function init(cb) {
  cboard = cb;
  fill();
  moveLen = 0;
  mpoint = 0;
  pi = -1;
  pj = -1;
  cboardHistory = [];
  cboardHistory[0] = cboard;
  sendChessboard(cboard.toString());
  disableButtons();
}

function fill() {
  for(var i = 0; i < 10; i++) {
    for(var j = 0; j < 8; j++) {
      if (i > 7 && j == 7) continue;
      fillCell(i, j);
    }
  }
}

function fillCell(i, j) {
  var cpiece = cboard.charAt(i * 8 + j);
  var code = cpiece == "_" ? "00" : coding[cpiece];
  document.getElementById("c" + i + j).className = "sprite " + "sprite-" + code + ((i + j) % 2);
}

function updateCharAt(aString, aN, aChar) {
  return aString.substring(0, aN) + aChar + aString.substring(aN + 1);
}

function selectColor(i,j) {
  var elt = document.getElementById("c" + i + j);
  elt.className += (elt.className ? " " : "") + "selected";
}

function onClickBoard(i, j) {
  if (pi == -1) {
    if (!((i == 8 && j == 6) || (i == 9 && j == 6)) && cboard.charAt(i * 8 + j) == "_") return;
    pi = i;
    pj = j;
    selectColor(i,j);
  } else {
    if (i < 8) {
      var tochange = cboard.charAt(pi * 8 + pj);
      cboard = updateCharAt(cboard, i * 8 + j, tochange);
      if (pi < 8) {
        cboard = updateCharAt(cboard , pi * 8 + pj, "_");
      }
      mpoint++;
      moveLen = mpoint;
      cboardHistory[mpoint] = cboard.toString();
      sendChessboard(cboard.toString());
      fillCell(pi, pj);
      fillCell( i,  j);
      disableButtons();
    }
    pi = -1;
  }
}

function disableButtons() {
  document.getElementById("prev").disabled = (mpoint == 0);
  document.getElementById("next").disabled = (mpoint == moveLen);
}

function movePrev() {
  if (mpoint > 0) {
    mpoint--;
    cboard = cboardHistory[mpoint];
    fill();
    disableButtons();
  }
  pi = -1;
}

function moveNext() {
  if (mpoint < moveLen) {
    mpoint++;
    cboard = cboardHistory[mpoint];
    fill();
    disableButtons();
  }
  pi = -1;
}

function positionStart(e) {
  init("rnbqkbnrpppppppp________________________________PPPPPPPPRNBQKBNRkqrbnp__KQRBNP__");
}

function positionClear(e) {
  init("________________________________________________________________kqrbnp__KQRBNP__");
}

function appendMessage(aFrom, aMessage) {
  var dt = document.createElement("dt");
  dt.appendChild(document.createTextNode(aFrom));
  var dd = document.createElement("dd");
  dd.appendChild(document.createTextNode(aMessage));
  var msgHistory = document.getElementById("msg-history");
  if (msgHistory.firstChild) {
    msgHistory.insertBefore(dd, msgHistory.firstChild);
    msgHistory.insertBefore(dt, msgHistory.firstChild);
  } else {
    msgHistory.appendChild(dt);
    msgHistory.appendChild(dd);
  }
}

function send() {
  var msg = document.getElementById("msg");
  var xml = <message type="chat">
	            <body>{msg.value}</body>
              <x xmlns="jabber:x:oob">
                <url>{Musubi.location.href}</url>
                <desc>Musubi Chess</desc>
              </x>);
            </message>;
  Musubi.send(xml);
  appendMessage("me", msg.value);
  msg.value = "";
  return false;
}

function sendChessboard(cb) {
  var xml = <message type="chat">
	            <body>{cb}</body>
              <chessboard xmlns={nsChessboard.uri}>{cb}</chessboard>
              <x xmlns="jabber:x:oob">
                <url>{Musubi.location.href}</url>
                <desc>Musubi Chess</desc>
              </x>);
            </message>;
  Musubi.send(xml);
}

function recv(xml) {
  if (xml.nsChessboard::chessboard.length()) {
    var cb = xml.nsChessboard::chessboard.toString();
    if (mpoint == moveLen) {
      cboard = cb;
      cboardHistory.push(cb);
      mpoint++;
      moveLen++;
      fill();
    } else {
      cboardHistory.push(cb);
      moveLen++;
    }
    disableButtons();
  } else {
    appendMessage(xml.@from.toString(),
                  xml.body.toString());
  }
}

function flipTable(e) {
  var arr = ["board", "bpieces", "wpieces"];
  for (var i = 0; i < arr.length; i++) {
    var elt = document.getElementById(arr[i]);
    while (elt.firstChild) elt.removeChild(elt.firstChild);
  }
  makeTable(document.getElementById("flip").checked);
  fill();
}

function makeTable(aFlip) {
  var ts = [[0,  8, 8, "board"],
            [8,  9, 7, "bpieces"],
            [9, 10, 7, "wpieces"]];
  for (var s = 0; s < ts.length; s++) {
    var t = ts[s];
    var table = document.createElement("table");
    table.setAttribute("cellpadding", 0);
    table.setAttribute("cellspacing", 0);
    for(var i = t[0]; i < t[1]; i++) {
      var tr = document.createElement("tr");
	    for(var j = 0; j < t[2]; j++) {
        var oi, oj;
        if (aFlip) {
          switch (s) {
          case 0: oi = 7 - i; oj = 7 - j; break;
          case 1: oi = i + 1; oj = j;     break;
          case 2: oi = i - 1; oj = j;     break;
          }
        } else {
          oi = i; oj = j;
        }
        var td = document.createElement("td");
        td.setAttribute("id", "c" + oi + oj);
        td.onclick = (function onClickBoardFactory(i, j) {
                        return function(e) {onClickBoard(i, j);};
                      })(oi, oj);
        tr.appendChild(td);
	    }
	    table.appendChild(tr);
    }
    document.getElementById(t[3]).appendChild(table);
  }
}

function main() {
  Musubi.init(recv);
  makeTable(document.getElementById("flip").checked);
  document.getElementById("start").onclick = positionStart;
  document.getElementById("clear").onclick = positionClear;
  document.getElementById("prev") .onclick = movePrev;
  document.getElementById("next") .onclick = moveNext;
  document.getElementById("flip") .onclick = flipTable;
  init("rnbqkbnrpppppppp________________________________PPPPPPPPRNBQKBNRkqrbnp__KQRBNP__");
}

window.onload = main;