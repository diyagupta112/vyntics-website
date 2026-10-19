import asyncio,json,urllib.request,websockets,base64
async def main():
 t=next(t for t in json.load(urllib.request.urlopen('http://localhost:9240/json')) if t['type']=='page')
 async with websockets.connect(t['webSocketDebuggerUrl'],max_size=25000000) as w:
  n=0
  async def call(m,p={}):
   nonlocal n
   n+=1;await w.send(json.dumps({'id':n,'method':m,'params':p}))
   while True:
    r=json.loads(await w.recv())
    if r.get('id')==n:return r.get('result',r)
  async def js(s):return (await call('Runtime.evaluate',{'expression':s,'returnByValue':True}))['result'].get('value')
  for slug in ['cloud-architecture-migration','devops-reliability','cloud-cost-optimization']:
   await call('Page.navigate',{'url':'http://localhost:3000/services/cloud-foundations/'+slug})
   for _ in range(100):
    if await js('!!document.querySelector("[data-cloud-sub-page]")&&document.readyState==="complete"'):break
    await asyncio.sleep(.2)
   await asyncio.sleep(.7)
   for width in [1280,1440,1920,820,360]:
    await call('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900});await asyncio.sleep(.2)
    result=await js('(()=>{let h=document.querySelector("[data-cloud-sub-page] section"),r=h.getBoundingClientRect(),c=h.querySelector("h1").parentElement.getBoundingClientRect();return {height:r.height,copy:c.height,clipped:c.top<r.top||c.bottom>r.bottom,overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll("main h1").length,sections:[...document.querySelectorAll("[data-cloud-sub-page] h2")].map(e=>e.textContent),heroImage:document.querySelector("[data-cloud-sub-page] img").getAttribute("src"),broken:[...document.querySelectorAll("img")].filter(i=>i.complete&&!i.naturalWidth).length}})()')
    print(slug,width,result,flush=True)
    shot=await call('Page.captureScreenshot',{'format':'png'});open('.qa/cloud-sub-'+slug+'-'+str(width)+'.png','wb').write(base64.b64decode(shot['data']))

asyncio.run(main())
