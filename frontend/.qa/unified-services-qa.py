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
   await js('document.querySelector("[role=tablist]").parentElement.parentElement.scrollIntoView({behavior:"instant",block:"start"})');await asyncio.sleep(.5)
   for width in [1440,820,360]:
    await call('Emulation.setDeviceMetricsOverride',{'width':width,'height':1200,'deviceScaleFactor':1,'mobile':width<=820})
    for theme in ['light','dark']:
     await js('document.documentElement.dataset.theme='+json.dumps(theme));await asyncio.sleep(.15)
     state=await js('(()=>{let tabs=document.querySelector("[role=tablist]"),box=tabs.parentElement.parentElement,css=getComputedStyle(box);return {overflow:document.documentElement.scrollWidth>innerWidth,unified:css.borderTopStyle==="solid"&&parseFloat(css.borderTopWidth)>0&&parseFloat(css.borderTopLeftRadius)>0,compact:box.className.includes("compact"),names:[...tabs.querySelectorAll("[role=tab]")].map(e=>e.textContent.trim())}})()')
     print('unified',slug,width,theme,state,flush=True);assert state['unified'] and not state['overflow'] and not state['compact']
     for i in range(await js('document.querySelectorAll("[role=tab]").length')):
      await js('document.querySelectorAll("[role=tab]")['+str(i)+'].click()');await asyncio.sleep(.45)
      panel=await js('(()=>{let p=document.querySelector("[role=tabpanel]"),c=p.querySelector("[class*=panelContent]"),r=c.getBoundingClientRect(),q=c.parentElement.getBoundingClientRect(),a=c.querySelector("a"),t=document.querySelector("[aria-selected=true]");return {fits:r.top>=q.top-1&&r.bottom<=q.bottom+1,href:a.getAttribute("href"),heading:c.querySelector("h3").textContent,labelled:p.getAttribute("aria-labelledby")===t.id,broken:[...p.querySelectorAll("img")].some(i=>i.complete&&!i.naturalWidth)}})()')
      print('panel',slug,width,theme,i,panel,flush=True);assert panel['fits'] and panel['labelled'] and not panel['broken'] and panel['href'].startswith('/services/')
     await js('document.querySelectorAll("[role=tab]")[0].click();document.querySelector("[role=tablist]").parentElement.parentElement.scrollIntoView({behavior:"instant",block:"start"})');await asyncio.sleep(.5)
     shot=await call('Page.captureScreenshot',{'format':'png'});open('.qa/'+slug+'-unified-'+str(width)+'-'+theme+'.png','wb').write(base64.b64decode(shot['data']))
   await call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
   await asyncio.sleep(.2)
   assert await js('[...document.querySelectorAll("[data-service-hero] [data-reveal]")].every(e=>getComputedStyle(e).opacity==="1")')
   if slug=='data-engineering':
    print('reduced video paused',await js('document.querySelector("[data-service-hero] video").paused'),flush=True)
    assert await js('document.querySelector("[data-service-hero] video").paused')
   await call('Emulation.setEmulatedMedia',{'features':[]})
  print('runtime errors',errors,flush=True);await call('Browser.close')
asyncio.run(main())
