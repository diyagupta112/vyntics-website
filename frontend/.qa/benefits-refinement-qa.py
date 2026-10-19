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
  p=json.load(open('.qa/cloud-sub-content.json'))['migration']['results'];results=[]
  await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/cloud-architecture-migration'});await asyncio.sleep(2)
  for motion in ['reduce','no-preference']:
   await c('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':motion}]})
   for width in [1280,1440,1920,820,360]:
    await c('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900})
    for theme in ['light','dark']:
     await js('document.documentElement.dataset.theme='+json.dumps(theme)+';document.querySelector("#migration-benefits").scrollIntoView()');await asyncio.sleep(1.3 if motion=='no-preference' else .3)
     for _ in range(30):
      if await js('(()=>{let i=document.querySelector("#migration-benefits img");return i.complete&&i.naturalWidth>0})()'):break
      await asyncio.sleep(.2)
     r=await js('(()=>{let s=document.querySelector("#migration-benefits"),items=[...s.querySelectorAll("li")],img=s.querySelector("img"),v=img.parentElement.getBoundingClientRect(),content=s.querySelector("ol").getBoundingClientRect();return {title:s.querySelector("h2").textContent,intro:s.querySelector("header p").textContent,titles:items.map(i=>i.querySelector("h3").textContent),descriptions:items.map(i=>i.querySelector("p").textContent),numbers:items.map(i=>i.querySelector("span").textContent),tops:items.map(i=>i.getBoundingClientRect().top),lines:items.map(i=>({width:i.getBoundingClientRect().width,border:getComputedStyle(i).borderBottomWidth,color:getComputedStyle(i).borderBottomColor,topBorder:getComputedStyle(i).borderTopWidth})),headingBottom:s.querySelector("header").getBoundingClientRect().bottom,visible:items.every(i=>getComputedStyle(i).opacity==="1"),imageLoaded:img.complete&&img.naturalWidth>0,src:img.getAttribute("src"),alt:img.alt,visual:{left:v.left,top:v.top,width:v.width,height:v.height},content:{left:content.left,top:content.top,right:content.right,bottom:content.bottom},overflow:document.documentElement.scrollWidth>innerWidth,boxes:items.some(i=>getComputedStyle(i).borderRadius!=="0px"),bottomAccent:!!s.querySelector("[class*=bottomAccent]"),rules:items.slice(1).every(i=>getComputedStyle(i).borderTopWidth==="1px"),carousel:!!s.querySelector("button,[aria-roledescription=carousel]")}})()')
     assert r['title']==p['title'] and r['intro']==p['introduction'] and r['titles']==[i['title'] for i in p['items']] and r['descriptions']==[i['description'] for i in p['items']]
     assert r['numbers']==['01','02','03','04'] 
     columns=1 if width<=560 else 2
     assert len(set(round(x,1) for x in r['tops']))==4//columns
     assert all(x['border']=='4px' and x['color']=='rgb(20, 83, 219)' and x['topBorder']=='0px' for x in r['lines'])
     assert r['visible'] and r['imageLoaded'] and 'cloud-architecture-and-migration.jpg' in urllib.parse.unquote(r['src']) and 'laptop' in r['alt'] and not r['overflow'] and not r['boxes'] and not r['bottomAccent'] and not r['carousel'],r
     if width>960:
      assert r['visual']['left']>r['content']['right'] and 400<=r['visual']['height']<=500
      assert r['visual']['top']>r['headingBottom']
     else:assert r['visual']['top']>=r['content']['bottom']
     results.append({'width':width,'theme':theme,'motion':motion,**r});print(width,theme,motion,'PASS',flush=True)
     if motion=='reduce' and width in [1440,360]:
      rect=await js('(()=>{let r=document.querySelector("#migration-benefits").getBoundingClientRect();return {x:0,y:r.top+scrollY,width:innerWidth-15,height:r.height,scale:1}})()')
      shot=await c('Page.captureScreenshot',{'format':'png','clip':rect,'captureBeyondViewport':True});open('.qa/benefits-refinement-'+str(width)+'-'+theme+'.png','wb').write(base64.b64decode(shot['data']))
  json.dump(results,open('.qa/benefits-refinement-results.json','w'),indent=2)
asyncio.run(main())
