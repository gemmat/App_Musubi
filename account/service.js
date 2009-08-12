function sendRequestUserInfo(aID) {
  Musubi.send(<musubi type="get">
                <account id={aID}/>
              </musubi>);
}

function send() {
  var o = Form.serialize("account", true);
  Musubi.send(<musubi type="set">
                <account id={o["userid"]}>
                  <name>{o["username"]}</name>
                  <domain>{o["domain"]}</domain>
                  <resource>{o["resource"]}</resource>
                  <jid>{o["username"] + "@" + o["domain"] + "/" + o["resource"]}</jid>
                  <address>{o["username"] + "@" + o["domain"]}</address>
                  <password>{o["password"]}</password>
                  <connectionHost>{o["connection-host"]}</connectionHost>
                  <connectionPort>{o["connection-port"]}</connectionPort>
                  <connectionSecurity>{o["connection-security"]}</connectionSecurity>
                  <comment></comment>
                </account>
              </musubi>);
  return false;
}

function recvTest0() {
  recv(<musubi type="result">
         <account id="0">
           <name>romeo</name>
           <domain>localhost</domain>
           <resource></resource>
           <jid>romeo@localhost/</jid>
           <address>romeo@localhost</address>
           <connectionHost>localhost</connectionHost>
           <connectionPort>5223</connectionPort>
           <connectionSecurity>0</connectionSecurity>
           <comment></comment>
         </account>
       </musubi>);
}

function recvTest1() {
  recv(<musubi type="result">
         <account id="0"/>
       </musubi>);
}
