import asyncio,json,urllib.request,websockets
async def main():
 t=next(t for t in json.load(urllib.request.urlopen('http://localhost:9240/json')) if t['type']=='page')
 async with websockets.connect(t['webSocketDebuggerUrl']) as w:
  n=0
  async def c(m,p):
   nonlocal n
   n+=1;await w.send(json.dumps({'id':n,'method':m,'params':p}))
   while True:
    r=json.loads(await w.recv())
    if r.get('id')==n:print(r);return r
  await c('Runtime.evaluate',{'expression':'document.querySelector("details").open=false;document.querySelector("summary").focus()'})
  await asyncio.sleep(.3)
  for typ in ['keyDown','keyUp']:await c('Input.dispatchKeyEvent',{'type':typ,'key':'Enter','code':'Enter','windowsVirtualKeyCode':13,'text':'\r'})
  await asyncio.sleep(.3)
  await c('Runtime.evaluate',{'expression':'document.querySelector("details").open'})
asyncio.run(main())
