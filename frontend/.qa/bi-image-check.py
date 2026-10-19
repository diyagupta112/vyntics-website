import asyncio,json,urllib.request,websockets
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
  await call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':2,'mobile':False})
  await call('Page.navigate',{'url':'http://localhost:3000/services/analytics-bi'})
  for _ in range(200):
   if await js('!!document.querySelector("[data-service-hero] img")&&document.querySelector("[data-service-hero] img").complete'):break
   await asyncio.sleep(.2)
  await asyncio.sleep(1)
  print(await js('(()=>{let i=document.querySelector("[data-service-hero] img"),r=i.getBoundingClientRect();return {src:i.currentSrc,natural:[i.naturalWidth,i.naturalHeight],frame:[r.width,r.height],requiredWidth:Math.max(r.width,r.height*5973/3360)*devicePixelRatio}})()'))
asyncio.run(main())
