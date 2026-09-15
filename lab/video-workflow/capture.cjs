const path=require('node:path');const fs=require('node:fs');
const playwrightPath=process.env.PLAYWRIGHT_PATH||path.resolve('../../../vetay/sys/engine/node_modules/playwright');
const {chromium}=require(playwrightPath);
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox']});try{const p=await b.newPage();p.on('console',m=>console.log(m.text()));p.on('pageerror',e=>console.error(e.message));await p.goto('http://127.0.0.1:4319/driver.html');await p.waitForFunction(()=>window.run);await p.evaluate(async config=>await window.run(config),JSON.parse(process.argv[2]));;}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
