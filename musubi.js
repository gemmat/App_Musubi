var Musubi = {
  eltIn:  null,
  eltOut: null,
  init: function MusubiInit() {
    if ("createEvent" in document) {
      this.eltIn  = document.createElement("xmppin");
      this.eltOut = document.createElement("xmppout");
      this.eltIn .style.display = "none";
      this.eltOut.style.display = "none";
      document.documentElement.appendChild(this.eltIn);
      document.documentElement.appendChild(this.eltOut);
      this.eltIn .addEventListener("DOMNodeInserted", this.listnerIn,  false);
      this.eltOut.addEventListener("DOMNodeInserted", this.listnerOut, false);
    }
  },
  listnerIn:  function xmppwebListenerIn(aEvt) {
    Musubi.onRecv(Musubi.DOMToE4X(aEvt.target));
  },
  listnerOut: function xmppwebListenerOut(aEvt) {
    if ("createEvent" in document) {
      var e = document.createEvent("Events");
      e.initEvent("XmppEvent", true, false);
      aEvt.target.dispatchEvent(e);
    }
  },
  onRecv: function xmppwebOnRecv(aXML) {
  },
  send: function xmppwebSend(aXML) {
    Musubi.eltOut.appendChild(Musubi.E4XToDOM(aXML));
  },
  DOMToE4X: function DOMToE4X(aDOMNode) {
    return new XML(new XMLSerializer().serializeToString(aDOMNode));
  },
  E4XToDOM: function E4XToDOM(aXML) {
    return document.importNode(
      new DOMParser().
        parseFromString(aXML.toXMLString(), "application/xml").
		    documentElement,
        true);
  }
};

