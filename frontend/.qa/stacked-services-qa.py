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
   expected={'cloud-foundations':3,'data-engineering':3,'analytics-bi':2,'ai-solutions':3,'crm-revenue-ops':2}[slug]
   assert await js('document.querySelectorAll("[data-service-rows] > li").length')==expected
   for width in [1440,820,360]:
    await call('Emulation.setDeviceMetricsOverride',{'width':width,'height':1100,'deviceScaleFactor':1,'mobile':width<=820})
    for theme in ['light','dark']:
     await js('document.documentElement.dataset.theme='+json.dumps(theme)+';document.querySelector("[data-service-rows]").parentElement.scrollIntoView({block:"start",behavior:"instant"})');await asyncio.sleep(.25)
     state=await js('(()=>{let box=document.querySelector("[data-service-rows]"),q=box.getBoundingClientRect(),css=getComputedStyle(box);return {overflow:document.documentElement.scrollWidth>innerWidth,unified:parseFloat(css.borderTopWidth)>0&&parseFloat(css.borderTopLeftRadius)>0,tabs:!!box.querySelector("[role=tab]"),rows:[...box.querySelectorAll(":scope > li")].map(li=>{let a=li.querySelector("a"),r=a.getBoundingClientRect();return {name:a.querySelector("h3").textContent,description:a.querySelector("p").textContent,href:a.getAttribute("href"),fits:r.left>=q.left&&r.right<=q.right&&r.top>=q.top&&r.bottom<=q.bottom,ownBorder:parseFloat(getComputedStyle(a).borderTopWidth),ownRadius:parseFloat(getComputedStyle(a).borderTopLeftRadius),broken:[...a.querySelectorAll("img")].some(i=>i.complete&&!i.naturalWidth)}})}})()')
     print(slug,width,theme,state,flush=True);assert state['unified'] and not state['overflow'] and not state['tabs']
     assert all(r['fits'] and not r['ownBorder'] and not r['ownRadius'] and not r['broken'] for r in state['rows'])
     r=await js('(()=>{let r=document.querySelector("[data-service-rows]").parentElement.getBoundingClientRect();return {x:0,y:Math.max(0,r.top+scrollY),width:innerWidth,height:r.height,scale:1}})()')
     shot=await call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True,'clip':r});open('.qa/'+slug+'-stacked-'+str(width)+'-'+theme+'.png','wb').write(base64.b64decode(shot['data']))
   await call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
   assert await js('[...document.querySelectorAll("[data-service-rows] a")].every(a=>getComputedStyle(a).transitionDuration==="0s")')
   await call('Emulation.setEmulatedMedia',{'features':[]})
  print('runtime errors',errors,flush=True);await call('Browser.close')
asyncio.run(main())
