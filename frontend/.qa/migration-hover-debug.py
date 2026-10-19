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
    if r.get('id')==n:print(m,r);return r
  await c('Emulation.setTouchEmulationEnabled',{'enabled':False})
  await c('Emulation.setEmitTouchEventsForMouse',{'enabled':False,'configuration':'desktop'})
  await c('Runtime.evaluate',{'expression':'({hover:matchMedia("(hover:hover)").matches,pointer:matchMedia("(pointer:fine)").matches})','returnByValue':True})
asyncio.run(main())
