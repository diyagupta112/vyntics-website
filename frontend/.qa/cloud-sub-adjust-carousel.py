import asyncio,json,urllib.request,websockets
async def main():
 t=next(t for t in json.load(urllib.request.urlopen('http://localhost:9240/json')) if t['type']=='page')
 async with websockets.connect(t['webSocketDebuggerUrl']) as w:
  n=0
  async def c(m,p={}):
   nonlocal n
   n+=1;await w.send(json.dumps({'id':n,'method':m,'params':p}))
   while True:
    r=json.loads(await w.recv())
    if r.get('id')==n:return r.get('result',r)
  async def js(s):return (await c('Runtime.evaluate',{'expression':s,'returnByValue':True}))['result'].get('value')
  await c('Page.navigate',{'url':'http://localhost:3100/services/cloud-foundations/devops-reliability'});await asyncio.sleep(2)
  initial=await js('document.querySelector("[data-cloud-sub-studies] h3").textContent')
  await js('[...document.querySelectorAll("[data-cloud-sub-studies] button")].find(b=>b.getAttribute("aria-label")?.includes("Next")).click()');await asyncio.sleep(.5)
  assert await js('document.querySelector("[data-cloud-sub-studies] h3").textContent')!=initial
  print('Existing case-study carousel advances between both real fallback projects.')
asyncio.run(main())
