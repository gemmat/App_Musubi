var nsXHTMLIm = new Namespace("http://jabber.org/protocol/xhtml-im");
var nsXHTML   = new Namespace("http://www.w3.org/1999/xhtml");

function appendHistory(aElement) {
  var history = $("history");
  if (history.firstChild) {
    history.insertBefore(aElement, history.firstChild);
  } else {
    history.appendChild(aElement);
  }
}

function appendMessage(aFrom, aMessage) {
  var li = new Element("li");
  li.appendChild(document.createTextNode(aFrom.replace(/@.*/, "") + ": " + aMessage));
  appendHistory(li);
}

function appendXHTMLMessage(aFrom, aMessage) {
  var dt = new Element("dt");
  var dd = new Element("dd");
  dt.appendChild(document.createTextNode(aFrom.replace(/@.*/, "")));
  dd.innerHTML = aMessage;
  var li = new Element("li");
  li.appendChild(dt);
  li.appendChild(dd);
  appendHistory(li);
}

function grep(aSourceText) {
  var regex = new RegExp($F("word"));
  return (regex.test(aSourceText));
}

function recv(aXML) {
  if (aXML.name().localName != "message") return;
  if (aXML.nsXHTMLIm::html.nsXHTML::body.length()) {
    var source = aXML.nsXHTMLIm::html.nsXHTML::body.toString();
    if (grep(source)) {
      delete aXML.@from;
      delete aXML.@to;
      Musubi.send(aXML);
      appendXHTMLMessage("grep", source);
    } else {
      appendXHTMLMessage(aXML.@from.toString(), source);
    }
  } else if (aXML.body.length()) {
    var source = aXML.body.toString();
    if (grep(source)) {
      delete aXML.@from;
      delete aXML.@to;
      Musubi.send(aXML);
      appendMessage("grep", source);
    } else {
      appendMessage(aXML.@from.toString(), source);
    }
  }
}

function main(e) {
  Musubi.init(recv);
}

Event.observe(window, "load", main);
