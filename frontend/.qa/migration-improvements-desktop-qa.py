import asyncio,json,urllib.request,websockets,base64
async def main():
 t=next(t for t in json.load(urllib.request.urlopen('http://localhost:9241/json')) if t['type']=='page')
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
  await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/cloud-architecture-migration'});await asyncio.sleep(2)
  results=[]
  expected=json.load(open('.qa/cloud-sub-content.json'))['migration']['results']
  for width in [1440]:
   await c('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900})
   for theme in ['light','dark']:
    await js('document.documentElement.dataset.theme='+json.dumps(theme)+';document.getElementById("migration-benefits").scrollIntoView()');await asyncio.sleep(.25)
    r=await js('(()=>{let s=document.getElementById("migration-benefits"),items=[...s.querySelectorAll("article")],grid=items[0].parentElement,layout=grid.parentElement;return {heading:s.querySelector("h2").textContent,intro:s.querySelector("header p").textContent,items:items.map(e=>({title:e.querySelector("h3").textContent,description:e.querySelector("p").textContent})),overflow:document.documentElement.scrollWidth>innerWidth,layoutColumns:getComputedStyle(layout).gridTemplateColumns,gridColumns:getComputedStyle(grid).gridTemplateColumns,height:s.getBoundingClientRect().height,transition:getComputedStyle(items[0]).transitionDuration,hidden:items.some(e=>getComputedStyle(e).opacity!=="1"),clipped:[...s.querySelectorAll("h2,h3,p")].some(e=>e.scrollWidth>e.clientWidth+1)}})()')
    assert r['heading']==expected['title'] and r['intro']==expected['introduction'] and r['items']==[{'title':x['title'],'description':x['description']} for x in expected['items']]
    assert not r['overflow'] and not r['hidden'] and not r['clipped'] and r['transition']=='0s',r
    results.append({'width':width,'theme':theme,**r});print(width,theme,r,flush=True)
    shot=await c('Page.captureScreenshot',{'format':'png'});open('.qa/migration-improvements-'+str(width)+'-'+theme+'.png','wb').write(base64.b64decode(shot['data']))
  await c('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]})
  await c('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
  await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/cloud-architecture-migration'});await asyncio.sleep(2)
  await js('document.getElementById("migration-benefits").scrollIntoView()');await asyncio.sleep(1.4)
  assert await js('[...document.querySelectorAll("#migration-benefits article")].every(e=>getComputedStyle(e).opacity==="1")')
  coords=await js('(()=>{let r=document.querySelector("#migration-benefits article").getBoundingClientRect();return {x:r.left+10,y:r.top+10}})()')
  print('Hover capability',await js('({hover:matchMedia("(hover:hover)").matches,pointer:matchMedia("(pointer:fine)").matches})'),coords,flush=True)
  before=await js('getComputedStyle(document.querySelector("#migration-benefits article")).backgroundColor')
  await c('Input.dispatchMouseEvent',{'type':'mouseMoved',**coords});await asyncio.sleep(.25)
  after=await js('getComputedStyle(document.querySelector("#migration-benefits article")).backgroundColor');assert before!=after
  print('Reveal and restrained hover PASS',before,after,flush=True)
  for slug in ['devops-reliability','cloud-cost-optimization']:
   await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/'+slug});await asyncio.sleep(2)
   assert await js('[...document.querySelectorAll("article")].every(e=>!e.className.includes("migration-improvements"))')
  json.dump(results,open('.qa/migration-improvements-results.json','w'),indent=2)
asyncio.run(main())
