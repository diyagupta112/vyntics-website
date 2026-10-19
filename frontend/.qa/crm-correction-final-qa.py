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
  async def js(s):
   r=await call('Runtime.evaluate',{'expression':s,'returnByValue':True});return r['result'].get('value')
  await call('Page.bringToFront');await call('Page.navigate',{'url':'http://localhost:3000/services/crm-revenue-ops'})
  for _ in range(200):
   if await js('document.readyState==="complete"&&!!document.querySelector("#crm-services")'):break
   await asyncio.sleep(.2)
  await asyncio.sleep(1)
  for width in [1920,360]:
   await call('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<=820})
   for theme in ['light','dark']:
    await js('document.documentElement.dataset.theme='+json.dumps(theme));await asyncio.sleep(.2)
    state=await js('(()=>{let h=document.querySelector("#crm-title-hero"),r=h.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll("main h1").length,title:document.querySelector("h1").textContent,lineSpans:[...h.querySelectorAll("h1 span")].map(e=>e.getBoundingClientRect().height),heroHeight:r.height,clipped:[...h.querySelectorAll("nav a")].filter(a=>{let q=a.getBoundingClientRect();return q.left<0||q.right>innerWidth||q.bottom>r.bottom}).length}})()')
    print(width,theme,state,flush=True);assert not state['overflow'] and not state['clipped'] and state['h1']==1
    if width==1920: assert max(state['lineSpans'])-min(state['lineSpans'])<1
    await js('window.scrollTo({top:0,behavior:"instant"})');await asyncio.sleep(.1)
    if width in [1440,360]:
     r=await call('Page.captureScreenshot',{'format':'png'});open('.qa/crm-corrected-'+str(width)+'-'+theme+'.png','wb').write(base64.b64decode(r['data']))
    for index in [0,1]:
     await js('document.querySelector("#crm-services").scrollIntoView({behavior:"instant",block:"center"});document.querySelectorAll("#crm-services [role=tab]")['+str(index)+'].click()');await asyncio.sleep(.5)
     p=await js('(()=>{let c=document.querySelector("#crm-services [class*=panelContent]"),f=c.parentElement,r=c.getBoundingClientRect(),q=f.getBoundingClientRect();return {title:c.querySelector("h3").textContent,points:c.querySelectorAll("li").length,top:Math.max(0,q.top-r.top),bottom:Math.max(0,r.bottom-q.bottom),compact:document.querySelector("#crm-services [class*=compactShowcase]")!==null}})()')
     print('services',width,theme,index,p,flush=True);assert p['top']<1 and p['bottom']<1 and p['points']==3 and not p['compact']
  await js('document.querySelector("#crm-services [role=tab]").focus()')
  await asyncio.sleep(.2)
  print('rotation paused on focus',await js('getComputedStyle(document.querySelector("#crm-services [data-paused]")).animationPlayState'),flush=True)
  print('pause control',await js('document.querySelector("#crm-services [aria-pressed]")?.textContent'),flush=True)
  await call('Browser.close')
asyncio.run(main())
