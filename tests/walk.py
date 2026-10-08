# Walk every scene, exercise interactions, collect errors, take screenshots. Run with the Kokoro venv python.
import sys,os,asyncio
from playwright.async_api import async_playwright
OUT=sys.argv[1] if len(sys.argv)>1 else 'tests/shots'
os.makedirs(OUT,exist_ok=True)
URL='file://'+os.path.abspath('docs/index.html')
ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']
async def run(pw,w,hgt,tag):
    try: b=await pw.chromium.launch(args=ARGS)
    except Exception: b=await pw.chromium.launch(channel='chrome',args=ARGS)
    p=await b.new_page(viewport={'width':w,'height':hgt})
    errs=[]
    p.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
    p.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' and 'GPU stall' not in m.text else None)
    await p.goto(URL); await p.click('#goSilent')
    n=await p.evaluate('SCENES.length')
    for i in range(n):
        await p.evaluate(f'go({i})'); await p.wait_for_timeout(1600)
        sid=await p.evaluate('SCENES[cur].id')
        # one interaction per scene
        try:
            if sid=='anatomy':
                await p.evaluate("document.querySelectorAll('#an-list li').forEach((l,i)=>{if(i<6)l.click()})")
                await p.evaluate("const s=document.querySelector('#an-ex input');s.value=.6;s.dispatchEvent(new Event('input'))")
            if sid=='fourstroke': await p.click('#fs-q'); await p.click('#fs-ans button')
            if sid=='cams': await p.click('#cm-play')
            if sid=='mixture': await p.evaluate("const s=document.querySelector('#mx-adv input');s.value=45;s.dispatchEvent(new Event('input'))")
            if sid=='cooling': await p.click('#co-type button:nth-child(3)')
            if sid=='oil': await p.click('#oi-drain'); await p.click('#oi-type button:nth-child(2)')
            if sid=='breathing': await p.evaluate("const s=document.querySelector('#br-thr input');s.value=.9;s.dispatchEvent(new Event('input'))")
            if sid=='layouts': await p.click('#ly-pick button:nth-child(3)')
            if sid=='power': await p.click('#pw-tab button:nth-child(2)')
            if sid=='dyno':
                bb=await p.locator('#dy-charts svg').first.bounding_box(); await p.mouse.move(bb['x']+bb['width']*.5,bb['y']+bb['height']*.5)
            if sid=='lab':
                await p.click('#lb-lay button:nth-child(7)'); await p.click('#lb-mode button:nth-child(3)')
            if sid=='quiz': await p.evaluate("document.querySelectorAll('.q').forEach(q=>q.querySelector('.opts button').click())")
        except Exception as e: errs.append(f'INTERACT {sid}: {e}')
        await p.wait_for_timeout(900)
        await p.screenshot(path=f'{OUT}/{tag}_{i+1:02d}_{sid}.png')
        sw=await p.evaluate('[document.documentElement.scrollWidth,innerWidth,LIVE.length]')
        if sw[0]>sw[1]: errs.append(f'HSCROLL {sid} {sw}')
    await p.evaluate('go(11)'); await p.wait_for_timeout(500)
    live=await p.evaluate('LIVE.length')
    if live: errs.append(f'LIVE not empty on 2D scene: {live}')
    await b.close(); return errs
async def main():
    async with async_playwright() as pw:
        for w,hgt,tag in [(1280,800,'d'),(390,800,'m')]:
            e=await run(pw,w,hgt,tag); print(tag,'errors:',len(e)); [print(' ',x[:300]) for x in e[:30]]
asyncio.run(main())
