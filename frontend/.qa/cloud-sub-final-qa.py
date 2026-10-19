import asyncio,json,urllib.request,websockets,base64
B='http://localhost:3100'
async def main():
 t=next(t for t in json.load(urllib.request.urlopen('http://localhost:9240/json')) if t['type']=='page')
 async with websockets.connect(t['webSocketDebuggerUrl'],max_size=30000000) as w:
  n=0
  async def call(m,p={}):
   nonlocal n
   n+=1;await w.send(json.dumps({'id':n,'method':m,'params':p}))
   while True:
    r=json.loads(await w.recv())
    if r.get('id')==n:return r.get('result',r)
  async def js(s):
   r=await call('Runtime.evaluate',{'expression':s,'returnByValue':True})
   if 'exceptionDetails' in r:raise RuntimeError(r)
   return r['result'].get('value')
  async def load(path):
   await call('Page.navigate',{'url':B+path});await asyncio.sleep(2)
   for _ in range(100):
    if await js('document.readyState==="complete" && location.pathname==='+json.dumps(path)+' && !!document.querySelector("main h1")'):break
    await asyncio.sleep(.1)
  paths=set();results=[]
  for key,slug in [('migration','cloud-architecture-migration'),('devops','devops-reliability'),('cost','cloud-cost-optimization')]:
   path='/services/cloud-foundations/'+slug;await load(path)
   seo=await js('(()=>{let p=document.querySelector("[data-cloud-sub-page]"),g=JSON.parse(p.querySelector("script").textContent)["@graph"];return {title:document.title,description:document.querySelector("meta[name=description]").content,canonical:document.querySelector("link[rel=canonical]").href,og:[...document.querySelectorAll("meta")].find(e=>e.getAttribute("property")==="og:url").content,types:g.map(x=>x["@type"]),faq:g.find(x=>x["@type"]==="FAQPage").mainEntity.length,h1:p.querySelectorAll("h1").length,details:p.querySelectorAll("details").length,studies:p.querySelectorAll("[data-cloud-sub-studies]").length,insights:p.querySelectorAll("[data-cloud-sub-insights]").length,links:[...p.querySelectorAll("a[href]")].map(x=>x.getAttribute("href")),form:[...p.querySelectorAll("form [name]")].map(x=>x.name)}})()')
   assert len(seo['title'])<60 and len(seo['description'])<155 and seo['canonical']=='https://vyntics.com'+path and seo['og']==seo['canonical']
   assert seo['h1']==1 and seo['details']==seo['faq']==6 and seo['studies']==seo['insights']==0
   assert ('HowTo' in seo['types'])==(key=='migration');assert seo['form']==['name','email','company','subject','message']
   for href in seo['links']:
    if href.startswith('/'):paths.add(href.split('#')[0] or '/')
    elif href.startswith('#'):assert await js('!!document.getElementById('+json.dumps(href[1:])+')')
   print('SEO PASS',key,seo,flush=True)
   for theme in ['light','dark']:
    await call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});await js('document.documentElement.dataset.theme='+json.dumps(theme))
    for width in [1280,1440,1920,820,360]:
     await call('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900});await js('scrollTo(0,0)');await asyncio.sleep(.15)
     r=await js('(()=>{let p=document.querySelector("[data-cloud-sub-page]"),h=p.querySelector("section"),r=h.getBoundingClientRect(),c=h.querySelector("h1").parentElement.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,heroHeight:r.height,copyFits:c.top>=r.top-1&&c.bottom<=r.bottom+1,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length,offscreen:[...p.querySelectorAll("h1,h2,h3,p,a")].filter(e=>{let r=e.getBoundingClientRect();return r.width&&(r.left< -1||r.right>innerWidth+1)}).map(e=>e.textContent),hidden:[...p.querySelectorAll("[data-reveal]")].filter(e=>getComputedStyle(e).opacity==="0").length}})()')
     assert not r['overflow'] and r['copyFits'] and not r['broken'] and not r['offscreen'] and not r['hidden'],(key,theme,width,r)
     results.append({'page':key,'theme':theme,'width':width,**r})
     if width in [1440,360]:
      shot=await call('Page.captureScreenshot',{'format':'png'});open('.qa/cloud-sub-final-'+key+'-'+theme+'-'+str(width)+'.png','wb').write(base64.b64decode(shot['data']))
   for width in [1440,360]:
    await call('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900})
    for anchor in ['contact',key+'-process']:
     await js('document.querySelector("#'+key+'-hero").querySelectorAll("a")['+str(0 if anchor=="contact" else 1)+'].click()');await asyncio.sleep(.2)
     a=await js('({path:location.pathname,hash:location.hash,top:document.getElementById('+json.dumps(anchor)+').getBoundingClientRect().top})')
     assert a['path']==path and a['hash']=='#'+anchor and 79<=a['top']<=110,(key,width,anchor,a)
    await js('document.querySelector("[data-cloud-sub-page] details").open=false;document.querySelector("[data-cloud-sub-page] details summary").focus()')
    await asyncio.sleep(.3)
    for typ in ['keyDown','keyUp']:await call('Input.dispatchKeyEvent',{'type':typ,'key':'Enter','code':'Enter','windowsVirtualKeyCode':13,'text':'\r'})
    await asyncio.sleep(.2)
    assert await js('document.querySelector("[data-cloud-sub-page] details").open');await js('document.querySelector("[data-cloud-sub-page] details").open=false')
   print('LAYOUT/ANCHORS/KEYBOARD PASS',key,flush=True)
  for path in sorted(paths):assert urllib.request.urlopen(B+path).status==200
  site=urllib.request.urlopen(B+'/sitemap.xml').read().decode()
  for slug in ['cloud-architecture-migration','devops-reliability','cloud-cost-optimization']:assert 'https://vyntics.com/services/cloud-foundations/'+slug in site
  for alias in ['/services/cloud-foundations/cloud-cost-optimisation','/services/cloud/cloud-cost-optimisation']:assert urllib.request.urlopen(B+alias).url.endswith('/services/cloud-foundations/cloud-cost-optimization')
  print('LINKS/SITEMAP/ALIASES PASS',sorted(paths),flush=True)
  await call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False});await call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]})
  await load('/services/cloud-foundations/cloud-architecture-migration');await asyncio.sleep(1)
  assert await js('getComputedStyle(document.querySelector("#migration-hero h1")).opacity')=='1'
  await js('document.querySelector("#migration-process").scrollIntoView()');await asyncio.sleep(1.3)
  assert await js('getComputedStyle(document.querySelector("#migration-process")).opacity')=='1'
  await js('scrollTo(0,0)');await asyncio.sleep(.15);assert await js('getComputedStyle(document.querySelector("#migration-process")).opacity')=='1'
  print('NORMAL MOTION REVEAL ONCE PASS',flush=True)
  await call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
  for slug in ['cloud-foundations','analytics-bi']:
   await load('/services/'+slug);await js('document.documentElement.dataset.theme="light"');await asyncio.sleep(.2)
   assert not await js('document.documentElement.scrollWidth>innerWidth')
   shot=await call('Page.captureScreenshot',{'format':'png'});open('.qa/cloud-sub-after-'+slug+'.png','wb').write(base64.b64decode(shot['data']))
  json.dump(results,open('.qa/cloud-sub-final-layout.json','w'),indent=2);print('ALL CHECKS PASS',flush=True)
asyncio.run(main())
