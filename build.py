# Build the single-file explainer: python3 build.py  -> dist/how-engines-work.html and docs/index.html
import json,os,base64,glob
os.chdir(os.path.dirname(os.path.abspath(__file__)))
N=json.load(open('narration.json'))
A={}
for sid in N:
    f=sorted(glob.glob(f'audio/{sid}.*.mp3'),key=os.path.getmtime)
    if f: A[sid]='data:audio/mpeg;base64,'+base64.b64encode(open(f[-1],'rb').read()).decode()
    else: print('missing audio for',sid)
js='\n'.join(open('parts/'+p).read() for p in ['engine.js','gl.js','scenes1.js','scenes2.js','scenes3.js'])
html=open('parts/head.html').read()
html=html.replace('__THREE__',open('vendor/three-bundle.js').read().replace('</script','<\\/script'))
html=html.replace('__NARR__',json.dumps(N)).replace('__AUDIO__',json.dumps(A)).replace('__JS__',js)
os.makedirs('dist',exist_ok=True);os.makedirs('docs',exist_ok=True)
for out in ['dist/how-engines-work.html','docs/index.html']: open(out,'w').write(html)
open('docs/.nojekyll','w').close()
print('built',len(html)//1024,'KB')
