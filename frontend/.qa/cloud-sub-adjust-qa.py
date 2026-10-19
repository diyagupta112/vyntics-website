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
  async def js(s):
   r=await c('Runtime.evaluate',{'expression':s,'returnByValue':True})
   if r.get('exceptionDetails'):raise Exception(r)
   return r['result'].get('value')
  await c('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
  data=[]
  for slug in ['cloud-foundations','cloud-foundations/cloud-architecture-migration','cloud-foundations/devops-reliability','cloud-foundations/cloud-cost-optimization']:
   await c('Page.navigate',{'url':'http://localhost:3100/services/'+slug});await asyncio.sleep(2)
   for width in [1280,1440,1920,820,360]:
    await c('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900});await js('scrollTo(0,0)');await asyncio.sleep(.15)
    r=await js('(()=>{let hero=document.querySelector("main section"),h=hero.getBoundingClientRect(),eye=hero.querySelector("p").getBoundingClientRect(),s=document.querySelector("[data-cloud-sub-studies]"),i=document.querySelector("[data-cloud-sub-insights]");return {heroTop:h.top,eyebrowTop:eye.top,overflow:document.documentElement.scrollWidth>innerWidth,breadcrumb:!!document.querySelector("nav[aria-label=Breadcrumb]"),studies:s?.dataset.contentState,insights:i?.dataset.contentState,studyLinks:s?[...s.querySelectorAll("a")].map(a=>a.getAttribute("href")):[],insightLinks:i?[...i.querySelectorAll("a")].map(a=>a.getAttribute("href")):[],headings:[...document.querySelectorAll("[data-cloud-sub-page] h2")].map(x=>x.textContent),schema:!![...document.querySelectorAll("script[type=\\\"application/ld+json\\\"]")].find(s=>s.textContent.includes("BreadcrumbList"))}})()')
    assert not r['overflow'],r
    if '/' in slug:assert not r['breadcrumb'] and r['heroTop'] in [72,80] and r['studies'] in ['recent','relevant','empty'] and r['insights'] in ['recent','relevant','empty'] and r['schema']
    data.append({'slug':slug,'width':width,**r});print(slug,width,r,flush=True)
    if '/' in slug and width in [1440,360]:
     for theme in ['light','dark']:
      await js('document.documentElement.dataset.theme='+json.dumps(theme))
      for name,selector in [('hero','main section'),('studies','[data-cloud-sub-studies]'),('insights','[data-cloud-sub-insights]')]:
       await js('document.querySelector('+json.dumps(selector)+').scrollIntoView()');await asyncio.sleep(.3)
       assert not await js('document.documentElement.scrollWidth>innerWidth')
       shot=await c('Page.captureScreenshot',{'format':'png'});open('.qa/cloud-sub-adjust-'+slug.split('/')[-1]+'-'+str(width)+'-'+theme+'-'+name+'.png','wb').write(base64.b64decode(shot['data']))
   await js('document.documentElement.dataset.theme="light"')
  json.dump(data,open('.qa/cloud-sub-adjust-layout.json','w'),indent=2)
asyncio.run(main())
