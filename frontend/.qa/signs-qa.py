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
   selector='#'+p['signs']['id']
   await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/'+p['slug']});await asyncio.sleep(2)
   for width in [1280,1440,1920,820,360]:
    await c('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900})
    for theme in ['light','dark']:
     await js('document.documentElement.dataset.theme='+json.dumps(theme)+';document.querySelector('+json.dumps(selector)+').scrollIntoView()');await asyncio.sleep(.25)
     r=await js('(()=>{let s=document.querySelector('+json.dumps(selector)+'),cards=[...s.querySelectorAll("article")];return {heading:s.querySelector("h2").textContent,intro:s.querySelector("header>p").textContent,titles:cards.map(c=>c.querySelector("h3").textContent),descriptions:cards.map(c=>c.querySelector("p").textContent),numbers:cards.map(c=>c.querySelector("span").textContent),highlighted:cards.filter(c=>c.className.includes("highlighted")).length,firstHighlighted:cards[0].className.includes("highlighted"),boxes:cards.map(c=>{let r=c.getBoundingClientRect();return {top:r.top,left:r.left,width:r.width,height:r.height}}),styles:cards.map(c=>({opacity:getComputedStyle(c).opacity,transition:getComputedStyle(c).transitionDuration,color:getComputedStyle(c.querySelector("p")).color,background:getComputedStyle(c).backgroundColor,image:getComputedStyle(c).backgroundImage})),overflow:document.documentElement.scrollWidth>innerWidth||cards.some(e=>e.scrollWidth>e.clientWidth+1),buttons:s.querySelectorAll("button,a,[tabindex]").length,carousel:!!s.querySelector("[aria-roledescription=carousel]")}})()')
     assert r['heading']=='Signs you need to change' and r['intro']==p['signs']['introduction']
     assert r['titles']==[x['title'] for x in p['signs']['items']] and r['descriptions']==[x['description'] for x in p['signs']['items']]
     assert r['numbers']==[str(i+1).zfill(2) for i in range(len(p['signs']['items']))]
     assert r['highlighted']==1 and r['firstHighlighted'] and not r['overflow'] and not r['carousel'] and not r['buttons']
     assert all(x['opacity']=='1' and x['transition']=='0s' for x in r['styles'])
     columns=4 if width>=1280 else 2 if width==820 else 1
     assert len(set(round(x['top'],1) for x in r['boxes']))==(len(r['boxes'])+columns-1)//columns
     for top in set(round(x['top'],1) for x in r['boxes']):
      heights=[x['height'] for x in r['boxes'] if round(x['top'],1)==top]
      assert max(heights)-min(heights)<1
     results.append({'key':key,'width':width,'theme':theme,**r});print(key,width,theme,'PASS',flush=True)
     if width in [1440,820,360]:
      rect=await js('(()=>{let r=document.querySelector('+json.dumps(selector)+').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:innerWidth-15,height:r.height,scale:1}})()')
      shot=await c('Page.captureScreenshot',{'format':'png','clip':rect,'captureBeyondViewport':True});open('.qa/signs-'+key+'-'+str(width)+'-'+theme+'.png','wb').write(base64.b64decode(shot['data']))
  json.dump(results,open('.qa/signs-results.json','w'),indent=2)
  await c('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
  await c('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]})
  await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/cloud-architecture-migration'});await asyncio.sleep(2)
  await js('document.querySelector("#migration-signs").scrollIntoView()');await asyncio.sleep(1.4)
  assert await js('[...document.querySelectorAll("#migration-signs article")].every(c=>getComputedStyle(c).opacity==="1")')
  card=await js('(()=>{let r=document.querySelectorAll("#migration-signs article")[1].getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+20}})()')
  await c('Input.dispatchMouseEvent',{'type':'mouseMoved',**card});await asyncio.sleep(.3)
  assert await js('document.querySelectorAll("#migration-signs article")[1].matches(":hover")')
  print('Normal scroll reveal and restrained hover PASS',flush=True)
asyncio.run(main())
