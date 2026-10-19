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
  results=[]
  for slug in ['cloud-foundations','data-engineering','analytics-bi','ai-solutions','crm-revenue-ops']:
   await call('Page.navigate',{'url':'http://localhost:3000/services/'+slug})
   for _ in range(200):
    if await js('!!document.querySelector("[data-service-hero]")&&document.readyState==="complete"'):break
    await asyncio.sleep(.2)
   await js('document.fonts.ready');await asyncio.sleep(.7)
   for width in [1280,1440,1920,820,360]:
    await call('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':width<=820});await asyncio.sleep(.15)
    result=await js('(()=>{let h=document.querySelector("[data-service-hero]"),c=h.querySelector("h1").parentElement,r=c.getBoundingClientRect(),v=h.querySelector("[class*=visual]").getBoundingClientRect();return {height:h.getBoundingClientRect().height,copy:r.height,visual:v.height,font:getComputedStyle(h.querySelector("h1")).fontSize,heading:h.querySelector("h1").getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth}})()')
    results.append({'slug':slug,'width':width,**result});print(results[-1],flush=True)
  open('.qa/hero-height-measurements.json','w').write(json.dumps(results))

asyncio.run(main())
