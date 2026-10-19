import asyncio,json,urllib.request,websockets
async def main():
 t=next(t for t in json.load(urllib.request.urlopen('http://localhost:9240/json')) if t['type']=='page')
 async with websockets.connect(t['webSocketDebuggerUrl']) as w:
  for n,e in enumerate(['({active:document.activeElement.outerHTML,open:document.querySelector("details").open})','document.querySelectorAll("details").length'],1):
   await w.send(json.dumps({'id':n,'method':'Runtime.evaluate','params':{'expression':e,'returnByValue':True}}))
   while True:
    r=json.loads(await w.recv())
    if r.get('id')==n:print(r);break
asyncio.run(main())
