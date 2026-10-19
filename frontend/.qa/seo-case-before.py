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
  async def js(s):return (await call('Runtime.evaluate',{'expression':s,'returnByValue':True}))['result'].get('value')
  for width in [1440,360]:
   await call('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<900})
   await call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
   await call('Page.navigate',{'url':'http://localhost:3000/case-studies'})
   for _ in range(200):
    if await js('!!document.querySelector("#case-studies-title")&&document.readyState==="complete"'):break
    await asyncio.sleep(.2)
   await asyncio.sleep(1)
   await js('document.documentElement.dataset.theme="light";window.scrollTo({top:0,behavior:"instant"})')
   shot=await call('Page.captureScreenshot',{'format':'png'});open('.qa/seo-case-hero-before-'+str(width)+'.png','wb').write(base64.b64decode(shot['data']))

asyncio.run(main())
