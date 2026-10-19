import asyncio,json,urllib.request,websockets,base64
main_routes=['/','/about','/services/cloud-foundations','/services/data-engineering','/services/analytics-bi','/services/ai-solutions','/services/crm-revenue-ops','/case-studies','/case-studies/ai-powered-customer-support-assistant','/blog','/blog/building-scalable-data-pipelines-with-apache-airflow-and-snowflake','/careers','/technologies','/contact','/recognitions']
subpages={'cloud-foundations':['cloud-architecture-migration','devops-reliability','cloud-cost-optimisation'],'data-engineering':['data-pipelines-integration','data-warehousing-lakehouse','data-quality-governance'],'analytics-bi':['dashboards-executive-reporting','bi-consulting'],'ai-solutions':['rag-knowledge-assistants','ai-agents','intelligent-automation'],'crm-revenue-ops':['crm-implementation-integration','sales-automation-revenue-analytics']}
routes=main_routes+['/services/'+pillar+'/'+slug for pillar,slugs in subpages.items() for slug in slugs]+['/careers/data-engineer-jaipur','/case-studies/legal-document-review-automation']
async def main():
 t=next(t for t in json.load(urllib.request.urlopen('http://localhost:9240/json')) if t['type']=='page')
 async with websockets.connect(t['webSocketDebuggerUrl'],max_size=30000000) as w:
  n=0;errors=[];results=[]
  async def call(m,p={}):
   nonlocal n
   n+=1;await w.send(json.dumps({'id':n,'method':m,'params':p}))
   while True:
    r=json.loads(await w.recv())
    if r.get('method')=='Runtime.exceptionThrown':errors.append(r['params']['exceptionDetails'].get('text'))
    if r.get('id')==n:return r.get('result',r)
  async def js(s):
   r=await call('Runtime.evaluate',{'expression':s,'returnByValue':True});return r['result'].get('value')
  await call('Runtime.enable')
  await call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
  for route in routes:
   await call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
   await call('Page.navigate',{'url':'http://localhost:3000'+route})
   for _ in range(100):
    if await js('!!document.querySelector("main h1")&&document.readyState==="complete"'):break
    await asyncio.sleep(.15)
   await asyncio.sleep(.3)
   for width,theme in ([(1440,'light'),(360,'light'),(1440,'dark')] if route in main_routes else [(1440,'light')]):
    await call('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900})
    await js('document.documentElement.dataset.theme='+json.dumps(theme))
    # Scroll through the page to exercise lazy images without changing source styles.
    height=await js('document.documentElement.scrollHeight')
    for y in range(0,min(height,18000),750):
     await js('window.scrollTo({top:'+str(y)+',behavior:"instant"})');await asyncio.sleep(.04)
    await asyncio.sleep(.25)
    state=await js('(()=>{let images=[...document.querySelectorAll("img")];return {title:document.title,description:document.querySelector("meta[name=description]")?.content,canonical:document.querySelector("link[rel=canonical]")?.href,imageCount:images.length,missingAlt:images.filter(i=>!i.hasAttribute("alt")).length,genericAlt:images.filter(i=>/^(image|photo|picture|banner|image 1)$/i.test(i.alt.trim())).map(i=>i.alt),broken:images.filter(i=>i.complete&&!i.naturalWidth).map(i=>({src:(i.currentSrc||i.src).split("?")[0],alt:i.alt})),overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll("main h1").length}})()')
    results.append({'route':route,'width':width,'theme':theme,**state});print(results[-1],flush=True)
    assert state['missingAlt']==0 and not state['genericAlt']
    if route in main_routes:
     await js('window.scrollTo({top:0,behavior:"instant"})');await asyncio.sleep(.1)
     shot=await call('Page.captureScreenshot',{'format':'png'});open('.qa/seo-'+(route.strip('/').replace('/','-') or 'home')+'-'+str(width)+'-'+theme+'.png','wb').write(base64.b64decode(shot['data']))
  open('.qa/image-seo-browser-results.json','w').write(json.dumps({'pages':results,'errors':errors}))
  print('Routes checked',len(routes),'runtime errors',errors,flush=True)
  await call('Browser.close')
asyncio.run(main())
