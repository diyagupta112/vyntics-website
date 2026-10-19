import asyncio,json,urllib.request,websockets,base64
async def main():
 t=next(t for t in json.load(urllib.request.urlopen('http://localhost:9240/json')) if t['type']=='page')
 async with websockets.connect(t['webSocketDebuggerUrl'],max_size=25000000) as w:
  n=0;errors=[]
  async def call(m,p={}):
   nonlocal n
   n+=1;await w.send(json.dumps({'id':n,'method':m,'params':p}))
   while True:
    r=json.loads(await w.recv())
    if r.get('method')=='Runtime.exceptionThrown':errors.append(r['params']['exceptionDetails'].get('text'))
    if r.get('id')==n:return r.get('result',r)
  async def js(s):
   r=await call('Runtime.evaluate',{'expression':s,'returnByValue':True});return r['result'].get('value')
  await call('Runtime.enable');await call('Page.bringToFront')
  for slug in ['cloud-foundations','data-engineering','analytics-bi','ai-solutions','crm-revenue-ops']:
   await call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
   await call('Page.navigate',{'url':'http://localhost:3000/services/'+slug})
   for _ in range(200):
    if await js('!!document.querySelector("[data-service-hero]")&&document.readyState==="complete"'):break
    await asyncio.sleep(.2)
   await asyncio.sleep(1.2)
   print('content',slug,await js('({h1:document.querySelectorAll("main h1").length,title:document.querySelector("main h1").textContent,links:[...document.querySelectorAll("[data-service-hero] a")].map(a=>({label:a.textContent,href:a.getAttribute("href")})),video:!!document.querySelector("[data-service-hero] video")})'),flush=True)
   assert await js('document.querySelectorAll("main h1").length')==1
   for width in [1280,1440,1920,820,360]:
    await call('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<=820})
    for theme in ['light','dark']:
     await js('document.documentElement.dataset.theme='+json.dumps(theme));await asyncio.sleep(.15)
     state=await js('(()=>{let h=document.querySelector("[data-service-hero]"),r=h.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,height:r.height,clipped:[...h.querySelectorAll("nav a")].filter(a=>{let q=a.getBoundingClientRect();return q.left<0||q.right>innerWidth||q.bottom>r.bottom}).length,broken:[...h.querySelectorAll("img")].filter(i=>i.complete&&i.naturalWidth===0).length}})()')
     print('fit',slug,width,theme,state,flush=True);assert not state['overflow'] and not state['clipped'] and not state['broken']
   await call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
   await js('document.documentElement.dataset.theme="light";window.scrollTo({top:0,behavior:"instant"})');await asyncio.sleep(.3)
   r=await call('Page.captureScreenshot',{'format':'png'});open('.qa/'+slug+'-hero.png','wb').write(base64.b64decode(r['data']))
   await call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
   await asyncio.sleep(.2)
   assert await js('[...document.querySelectorAll("[data-service-hero] [data-reveal]")].every(e=>getComputedStyle(e).opacity==="1")')
   if slug=='data-engineering':
    print('reduced video paused',await js('document.querySelector("[data-service-hero] video").paused'),flush=True)
    assert await js('document.querySelector("[data-service-hero] video").paused')
   await call('Emulation.setEmulatedMedia',{'features':[]})
  print('runtime errors',errors,flush=True);await call('Browser.close')
asyncio.run(main())
