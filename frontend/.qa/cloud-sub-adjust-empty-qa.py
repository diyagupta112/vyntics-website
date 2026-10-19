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
  async def js(s):return (await c('Runtime.evaluate',{'expression':s,'returnByValue':True}))['result'].get('value')
  await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/cloud-architecture-migration'});await asyncio.sleep(2)
  html=open('.qa/cloud-sub-empty-render.html').read()
  await js('(()=>{let d=new DOMParser().parseFromString('+json.dumps(html)+',"text/html"),prefix=document.querySelector("[data-cloud-sub-page]").className.replace(/__page$/, "__"),button=document.querySelector("#migration-hero a").className;["[data-cloud-sub-studies]","[data-cloud-sub-insights]"].forEach(selector=>{let target=document.querySelector(selector),card=d.querySelector(selector+" .referenceEmpty");card.className=prefix+"referenceEmpty";card.querySelector("a").className=button;[...target.firstElementChild.children].slice(1).forEach(x=>x.remove());target.firstElementChild.append(card)})})()')
  for width in [1440,360]:
   await c('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900})
   for theme in ['light','dark']:
    await js('document.documentElement.dataset.theme='+json.dumps(theme))
    await js('document.querySelector("[data-cloud-sub-studies]").scrollIntoView()');await asyncio.sleep(.2)
    assert not await js('document.documentElement.scrollWidth>innerWidth')
    assert await js('[...document.querySelectorAll("[data-cloud-sub-studies] a,[data-cloud-sub-insights] a")].every(a=>a.getAttribute("href")==="/case-studies"||a.getAttribute("href")==="/blog")')
    shot=await c('Page.captureScreenshot',{'format':'png'});open('.qa/cloud-sub-adjust-empty-'+str(width)+'-'+theme+'.png','wb').write(base64.b64decode(shot['data']))
  await c('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
  for slug in ['cloud-foundations','analytics-bi']:
   await c('Page.navigate',{'url':'http://localhost:3100/services/'+slug});await asyncio.sleep(2);await js('document.documentElement.dataset.theme="light";scrollTo(0,0)')
   shot=await c('Page.captureScreenshot',{'format':'png'});open('.qa/cloud-sub-adjust-pillar-'+slug+'.png','wb').write(base64.b64decode(shot['data']))
  print('Empty-state desktop/mobile and light/dark layouts pass; existing pillars captured.')
asyncio.run(main())
