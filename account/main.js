function sendReadAllAccount() {
  Musubi.send(<musubi type="get">
                <accounts/>
              </musubi>);
}

function sendReadAccount(aBarejid) {
  Musubi.send(<musubi type="get">
                <account>
                  <barejid>{aBarejid}</barejid>
                </account>
              </musubi>);
}

function sendCreateUpdateAccount() {
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

function sendDeleteAccount(aBarejid) {
  Musubi.send(<musubi type="set">
                <account del="del">
                  <barejid>{aBarejid}</barejid>
                </account>
              </musubi>);
}

function sendGetDefaultAccount() {
  Musubi.send(<musubi type="get">
                <defaultaccount/>
              </musubi>);
}

function sendSetDefaultAccount(aBarejid) {
  Musubi.send(<musubi type="set">
                <defaultaccount>{aBarejid}</defaultaccount>
              </musubi>);
}

function recvTestRAll() {
  recv(<musubi type="result">
         <accounts>
           <account>
             <barejid>romeo@localhost</barejid>
             <resource>Musubi</resource>
             <connectionHost>localhost</connectionHost>
             <connectionPort>5223</connectionPort>
             <connectionScrty>0</connectionScrty>
             <comment></comment>
           </account>
           <account>
             <barejid>teruakigemma@gmail</barejid>
             <resource></resource>
             <connectionHost>talk.google.com</connectionHost>
             <connectionPort>443</connectionPort>
             <connectionScrty>1</connectionScrty>
             <comment></comment>
           </account>
         </accounts>
       </musubi>);
}

function recvTestR() {
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

function recvTestCU() {
  recv(<musubi type="result">
         <account/>
       </musubi>);
}

function recvTestD() {
  recv(<musubi type="result">
         <account del="del"/>
       </musubi>);
}

function recvTest0() {
  recv(<musubi type="result">
         <defaultaccount>romeo@localhost</defaultaccount>
       </musubi>);
}

