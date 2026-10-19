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
  pages=json.load(open('.qa/cloud-sub-content.json'));results=[]
  await c('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
  for key,p in pages.items():
   await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/'+p['slug']});await asyncio.sleep(2.5)
   for width in [1280,1440,1920,820,360]:
    await c('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900})
    for theme in ['light','dark']:
     await js('document.documentElement.dataset.theme='+json.dumps(theme)+';document.getElementById('+json.dumps(key+'-process')+').scrollIntoView()');await asyncio.sleep(.3)
     r=await js('(()=>{let s=document.querySelector("[data-cloud-workflow]"),section=s.closest("section"),nodes=[...s.querySelectorAll("[data-workflow-node]")],path=s.querySelector("svg path"),ctm=path.getScreenCTM(),length=path.getTotalLength(),samples=[];for(let i=0;i<=length;i+=2){let p=path.getPointAtLength(i);samples.push({x:ctm.a*p.x+ctm.e,y:ctm.d*p.y+ctm.f})}return {heading:section.querySelector("h2").textContent,intro:section.querySelector("h2").nextElementSibling.textContent,eyebrow:section.querySelector("h2").previousElementSibling.textContent,items:[...s.querySelectorAll("li")].map(e=>({title:e.querySelector("h3").textContent,visual:e.querySelector("h3").nextElementSibling.textContent,description:e.querySelector("article p:last-child").textContent})),positions:nodes.map(e=>{let b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}}),maxPathDistance:Math.max(...nodes.map(e=>{let b=e.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2;return Math.min(...samples.map(p=>Math.hypot(p.x-x,p.y-y)))})),moves:(path.getAttribute("d").match(/M/g)||[]).length,length,overflow:document.documentElement.scrollWidth>innerWidth,clipped:[...s.querySelectorAll("h3,article p")].some(e=>e.scrollWidth>e.clientWidth+1),opacity:[...s.querySelectorAll("article")].every(e=>getComputedStyle(e).opacity==="1"),transition:getComputedStyle(nodes[0]).transitionDuration,reduced:matchMedia("(prefers-reduced-motion: reduce)").matches,markerColors:nodes.map(e=>getComputedStyle(e).backgroundColor),active:[...s.querySelectorAll("li")].every(e=>e.dataset.active==="true")}})()')
     assert r['heading']==p['process']['title'] and r['intro']==p['process']['introduction'] and r['eyebrow']=='How we work'
     assert r['items']==p['process']['steps']
     assert r['moves']==1 and r['length']>0 and r['maxPathDistance']<3 and not r['overflow'] and not r['clipped'] and r['opacity'] and r['transition']=='0s' and r['reduced'] and all(x=='rgb(20, 83, 219)' for x in r['markerColors']),(key,width,theme,r)
     columns=1 if width<=620 else 2 if width<=960 else min(4,(len(p['process']['steps'])+1)//2)
     for index in range(1,len(r['positions'])):
      a,b=r['positions'][index-1],r['positions'][index]
      if index%columns==0:assert b['y']>a['y']
      else:assert (b['x']>a['x'])==(index//columns%2==0)
     results.append({'key':key,'width':width,'theme':theme,**r});print(key,width,theme,'PASS','distance',r['maxPathDistance'],flush=True)
     if width in [1440,820,360]:
      rect=await js('(()=>{let r=document.getElementById('+json.dumps(key+'-process')+').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:innerWidth-15,height:r.height,scale:1}})()')
      shot=await c('Page.captureScreenshot',{'format':'png','clip':rect,'captureBeyondViewport':True});open('.qa/cloud-workflow-'+key+'-'+str(width)+'-'+theme+'.png','wb').write(base64.b64decode(shot['data']))
  json.dump(results,open('.qa/cloud-workflow-results.json','w'),indent=2)
  await c('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
  await c('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]})
  await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/cloud-architecture-migration'});await asyncio.sleep(2)
  await js('document.getElementById("migration-process").scrollIntoView()');await asyncio.sleep(1.6)
  assert await js('[...document.querySelectorAll("[data-cloud-workflow] article")].every(e=>getComputedStyle(e).opacity==="1")')
  assert await js('document.querySelector("[data-cloud-workflow] svg path:nth-child(2)").getAttribute("stroke-dasharray")!==null')
  print('NORMAL REVEAL AND SCROLL PATH PASS',flush=True)
  for slug in ['cloud-foundations','data-engineering','analytics-bi']:
   await c('Page.navigate',{'url':'http://localhost:3100/services/'+slug});await asyncio.sleep(2)
   assert await js('!document.querySelector("[data-cloud-workflow]")')
  print('PILLAR DEFAULTS UNCHANGED PASS',flush=True)
asyncio.run(main())
