# Render narration.json to MP3 clips with Kokoro (cached by text hash). Run with the Kokoro venv python.
import json,re,os,hashlib,subprocess,soundfile as sf
from kokoro_onnx import Kokoro
K=os.environ.get('KOKORO_DIR',os.path.expanduser('~/.cache/kokoro'))
try:
    import imageio_ffmpeg; FF=imageio_ffmpeg.get_ffmpeg_exe()
except Exception: FF='ffmpeg'
VOICE='am_michael'
def say(t):
    for a,b in [('rpm','R P M'),('Classic 350','Classic three fifty'),('Himalayan 450','Himalayan four fifty'),('Interceptor 650','Interceptor six fifty'),('Ustad','Oo-staad')]: t=t.replace(a,b)
    return t
N=json.load(open('narration.json')); os.makedirs('audio',exist_ok=True)
k=Kokoro(f'{K}/kokoro-v1.0.onnx',f'{K}/voices-v1.0.bin')
for sid,txt in N.items():
    s=say(txt); h=hashlib.md5((s+VOICE).encode()).hexdigest()[:8]; out=f'audio/{sid}.{h}.mp3'
    if os.path.exists(out): continue
    [os.remove('audio/'+f) for f in os.listdir('audio') if f.startswith(sid+'.')]
    a,sr=k.create(s,voice=VOICE,speed=1.0,lang='en-us'); sf.write('tmp.wav',a,sr)
    subprocess.run([FF,'-y','-loglevel','error','-i','tmp.wav','-ac','1','-b:a','48k',out],check=True); print('rendered',out)
if os.path.exists('tmp.wav'): os.remove('tmp.wav')
