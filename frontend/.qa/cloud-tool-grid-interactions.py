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
  for key,p in []:
   selector='#devops-tools' if key=='devops' else '[data-reveal="'+key+'-platforms"] section'
   await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/'+p['slug']});await asyncio.sleep(2)
   for width in [1280,1440,1920,820,360]:
    await c('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900})
    for theme in ['light','dark']:
     await js('document.documentElement.dataset.theme='+json.dumps(theme)+';document.querySelector('+json.dumps(selector)+').scrollIntoView()');await asyncio.sleep(.2)
     r=await js('(()=>{let s=document.querySelector('+json.dumps(selector)+'),cards=[...s.querySelectorAll("article,ul>li")],grid=cards[0].parentElement;return {heading:s.querySelector("h2").textContent,intro:s.querySelector("header>p:last-child").textContent,titles:cards.map(c=>c.querySelector("h3 a")?.firstChild.textContent??c.querySelector("h3").textContent),descriptions:cards.map(c=>c.querySelector("p")?.textContent??null),roles:cards.map(c=>c.querySelector("article>span")?.textContent??null),boxes:cards.map(c=>{let r=c.getBoundingClientRect();return {top:r.top,width:r.width,height:r.height}}),display:getComputedStyle(grid).display,overflow:document.documentElement.scrollWidth>innerWidth||grid.scrollWidth>grid.clientWidth+1,gridColumns:getComputedStyle(grid).gridTemplateColumns.split(" ").length,transition:getComputedStyle(cards[0]).transitionDuration,clipped:[...s.querySelectorAll("h3,p")].some(e=>e.scrollWidth>e.clientWidth+1),buttons:s.querySelectorAll("button").length,svg:s.querySelectorAll("svg").length,links:[...s.querySelectorAll("a")].map(a=>a.getAttribute("href")),carousel:!!s.querySelector("[aria-roledescription=carousel]"),hidden:getComputedStyle(s).opacity!=="1"}})()')
     assert r['display']=='grid' and not r['overflow'] and not r['clipped'] and not r['buttons'] and not r['svg'] and not r['carousel'] and not r['hidden'] and r['transition']=='0s',r
     if key=='devops':
      assert r['titles']==p['tools'] and r['descriptions']==[None]*8 and r['links']==['/technologies']*8
      assert r['heading']=='Tools we use' and r['intro']=='We select tools around your delivery process, application requirements, and the systems your team can maintain.'
     else:
      assert r['heading']==p['platforms']['title'] and r['intro']==p['platforms']['introduction']
      assert r['titles']==[x['name'] for x in p['platforms']['items']] and r['descriptions']==[x['description'] for x in p['platforms']['items']] and not r['links']
     assert max(x['width'] for x in r['boxes'])-min(x['width'] for x in r['boxes'])<1
     assert max(x['height'] for x in r['boxes'])-min(x['height'] for x in r['boxes'])<1
     assert r['gridColumns']==(1 if width==360 else 2 if width==820 else 4 if key=='devops' else 3)
     if width==820 or key=='devops':assert max(x['top'] for x in r['boxes'])>min(x['top'] for x in r['boxes'])
     results.append({'key':key,'width':width,'theme':theme,**r});print(key,width,theme,'PASS',r['gridColumns'],flush=True)
     if width in [1440,820,360]:
      rect=await js('(()=>{let r=document.querySelector('+json.dumps(selector)+').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:innerWidth-15,height:r.height,scale:1}})()')
      shot=await c('Page.captureScreenshot',{'format':'png','clip':rect,'captureBeyondViewport':True});open('.qa/cloud-tool-grid-'+key+'-'+str(width)+'-'+theme+'.png','wb').write(base64.b64decode(shot['data']))
  json.dump(results,open('.qa/cloud-tool-grid-results.json','w'),indent=2)
  await c('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
  await c('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]})
  await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/devops-reliability'});await asyncio.sleep(2)
  await js('document.querySelector("#devops-tools").scrollIntoView()');await asyncio.sleep(1.3)
  assert await js('getComputedStyle(document.querySelector("#devops-tools ul")).opacity==="1"')
  await js('document.querySelector("#devops-tools a").focus()')
  for typ in ['keyDown','keyUp']:await c('Input.dispatchKeyEvent',{'type':typ,'key':'Tab','code':'Tab','windowsVirtualKeyCode':9})
  await asyncio.sleep(.2)
  assert await js('!!document.activeElement.closest("#devops-tools")&&getComputedStyle(document.activeElement).outlineStyle==="solid"')
  print('Existing reveal and keyboard focus PASS',flush=True)
  await c('Page.navigate',{'url':'http://localhost:3100/services/data-engineering/data-pipelines-integration'});await asyncio.sleep(2)
  assert await js('!document.querySelector("[class*=editorial-tool-grid]")')
  print('Other service-page tool presentation remains unchanged PASS',flush=True)
asyncio.run(main())
