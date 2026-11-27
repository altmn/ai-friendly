"""Read native skills/list via the installed Codex app-server stdio protocol."""
import argparse,json,selectors,subprocess,time,shutil
from pathlib import Path
def main():
    p=argparse.ArgumentParser();p.add_argument('--workspace',type=Path,required=True);p.add_argument('--binary',type=Path);a=p.parse_args()
    found=str(a.binary) if a.binary else shutil.which('codex')
    if not found:raise SystemExit('Select an independently installed Codex CLI.')
    child=subprocess.Popen([str(Path(found).resolve(strict=True)),'app-server','--stdio'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    def send(x):child.stdin.write(json.dumps(x)+'\n');child.stdin.flush()
    sel=selectors.DefaultSelector();sel.register(child.stdout,selectors.EVENT_READ)
    def response(id):
        end=time.monotonic()+20
        while time.monotonic()<end:
            if not sel.select(timeout=1):continue
            line=child.stdout.readline()
            if not line:break
            data=json.loads(line)
            if data.get('id')==id:return data
        raise TimeoutError('Native app-server response deadline')
    try:
        send({'id':1,'method':'initialize','params':{'clientInfo':{'name':'ai-friendly-native-acceptance','version':'1.0.0'}}});init=response(1)
        send({'method':'initialized','params':{}})
        send({'id':2,'method':'skills/list','params':{'cwds':[str(a.workspace/'codex'/x/'work') for x in ['candidate','control']],'forceReload':True}})
        result=response(2)
        (a.workspace/'private/codex-discovery-raw.json').write_text(json.dumps(result,indent=2)+'\n')
        entries=result.get('result',{}).get('data',[])
        summary={'native_protocol':'skills/list','init_succeeded':'result' in init,'error':result.get('error'),'entries':[{'condition':'candidate' if '/candidate/' in e.get('cwd','') else 'control','target_skills':[s for s in e.get('skills',[]) if s.get('name')=='ai-friendly-audit'],'errors':e.get('errors',[])} for e in entries]}
        (a.workspace/'private/codex-discovery.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
    finally:
        child.terminate()
        try:child.wait(timeout=5)
        except subprocess.TimeoutExpired:child.kill();child.wait()
        sel.close()
if __name__=='__main__':main()
