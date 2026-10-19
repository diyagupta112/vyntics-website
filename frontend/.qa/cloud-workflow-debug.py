import asyncio,json,urllib.request,websockets
async def main():
 t=next(t for t in json.load(urllib.request.urlopen('http://localhost:9240/json')) if t['type']=='page')
 async with websockets.connect(t['webSocketDebuggerUrl']) as w:
  await w.send(json.dumps({'id':1,'method':'Runtime.evaluate','params':{'expression':'({reduce:matchMedia("(prefers-reduced-motion: reduce)").matches,li:[...document.querySelectorAll("[data-cloud-workflow] li")].map(x=>({active:x.dataset.active,bg:getComputedStyle(x.querySelector("[data-workflow-node]")).backgroundColor})),paths:[...document.querySelectorAll("[data-cloud-workflow] svg path")].slice(0,2).map(x=>({d:x.getAttribute("d"),dash:getComputedStyle(x).strokeDasharray}))})','returnByValue':True}}))
  while True:
   r=json.loads(await w.recv())
   if r.get('id')==1:print(r);break
asyncio.run(main())
