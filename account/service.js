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
                  <barejid>{o["username"] + "@" + o["domain"]}</barejid>
                  <fulljid>{o["username"] + "@" + o["domain"] + "/" + o["resource"]}</fulljid>
                  <password>{o["password"]}</password>
                   <connectionHost>{o["connection-host"]}</connectionHost>
                   <connectionPort>{o["connection-port"]}</connectionPort>
                  <connectionScrty>{o["connection-scrty"]}</connectionScrty>
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
           <barejid>romeo@localhost</barejid>
           <fulljid>romeo@localhost/</fulljid>
           <connectionHost>localhost</connectionHost>
           <connectionPort>5223</connectionPort>
           <connectionScrty>0</connectionScrty>
           <comment></comment>
         </account>
       </musubi>);
}

function recvTest1() {
  recv(<musubi type="result">
         <account id="0"/>
       </musubi>);
}
