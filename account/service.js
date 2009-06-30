function send() {
  var o = Form.serialize("account", true);
  Musubi.send(<musubi>
                <accounts type="set">
                  <account id={o["userid"]}>
                    <name>{o["username"]}</name>
                    <domain>{o["domain"]}</domain>
                    <resource>{o["resource"]}</resource>
                    <jid>{o["username"] + "@" + o["domain"]}</jid>
                    <connectionHost>{o["connection-host"]}</connectionHost>
                    <connectionPort>{o["connection-port"]}</connectionPort>
                    <connectionSecurity>{o["connection-security"]}</connectionSecurity>
                    <comment></comment>
                  </account>
                </accounts>
              </musubi>);
  return false;
}

function recvTest0() {
  recv(<musubi>
         <accounts type="result">
           <account id="0">
             <name>romeo</name>
             <domain>localhost</domain>
             <resource>Musubi</resource>
             <jid>romeo@localhost/Musubi</jid>
             <connectionHost>localhost</connectionHost>
             <connectionPort>5223</connectionPort>
             <connectionSecurity>0</connectionSecurity>
             <comment></comment>
           </account>
         </accounts>
       </musubi>);
}

function sendRequestUserInfo(aID) {
  Musubi.send(<musubi>
                <accounts type="get">
                  <account id={aID}/>
                </accounts>
              </musubi>);
}
