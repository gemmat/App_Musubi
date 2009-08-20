function sendRequestUserInfo(aBarejid) {
  Musubi.send(<musubi type="get">
                <account>
                  <barejid>{aBarejid}</barejid>
                </account>
              </musubi>);
}

function send() {
  var o = Form.serialize("account", true);
  Musubi.send(<musubi type="set">
                <account>
                  <barejid>{o["username"] + "@" + o["domain"]}</barejid>
                  <resource>{o["resource"]}</resource>
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
         <account>
           <barejid>romeo@localhost</barejid>
           <resource></resource>
           <connectionHost>localhost</connectionHost>
           <connectionPort>5223</connectionPort>
           <connectionScrty>0</connectionScrty>
           <comment></comment>
         </account>
       </musubi>);
}

function recvTest1() {
  recv(<musubi type="result">
         <account/>
       </musubi>);
}
