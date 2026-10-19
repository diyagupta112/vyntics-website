import asyncio,json,urllib.request,websockets,base64
async def main():
 t=next(t for t in json.load(urllib.request.urlopen('http://localhost:9240/json')) if t['type']=='page')
 async with websockets.connect(t['webSocketDebuggerUrl'],max_size=30000000) as w:
  n=0
  async def c(m,p={}):
   nonlocal n
   n+=1;await w.send(json.dumps({'id':n,'method':m,'params':p}))
   while True:
    r=json.loads(await w.recv())
    if r.get('id')==n:return r.get('result',r)
  async def js(s):return (await c('Runtime.evaluate',{'expression':s,'returnByValue':True}))['result'].get('value')
  await c('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
  await c('Emulation.setDeviceMetricsOverride',{'width':360,'height':1000,'deviceScaleFactor':1,'mobile':True})
  for key,slug,section in [('migration','cloud-architecture-migration','migration-architecture'),('devops','devops-reliability','devops-architecture'),('cost','cloud-cost-optimization','finops')]:
   await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/'+slug});await asyncio.sleep(2)
   await js('document.documentElement.dataset.theme="light";document.getElementById('+json.dumps(section)+').scrollIntoView()');await asyncio.sleep(.2)
   shot=await c('Page.captureScreenshot',{'format':'png'});open('.qa/cloud-sub-details-'+key+'.png','wb').write(base64.b64decode(shot['data']))
   assert await js('!!document.querySelector("footer a[href=\"/services/cloud-foundations/cloud-cost-optimization\"]")'.replace('"/services','\"/services').replace('optimization"]','optimization\"]')) if False else await js('[...document.querySelectorAll("footer a")].some(a=>a.getAttribute("href")==="/services/cloud-foundations/cloud-cost-optimization")')
   assert not await js('[...document.querySelectorAll("a")].some(a=>a.getAttribute("href")?.includes("cloud-cost-optimisation"))')
  await c('Page.navigate',{'url':'http://localhost:3100/'});await asyncio.sleep(2);assert await js('!!document.getElementById("services")')
  await c('Emulation.setScriptExecutionDisabled',{'value':True});await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/cloud-architecture-migration'});await asyncio.sleep(2)
  await c('Emulation.setScriptExecutionDisabled',{'value':False})
  assert await js('getComputedStyle(document.querySelector("h1")).opacity')=='1'
  print('Footer canonical links, home Services anchor and no-JS visible content PASS')
asyncio.run(main())
