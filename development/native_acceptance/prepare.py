"""Prepare disposable project-scoped candidates and target-absent controls."""
from pathlib import Path
import argparse,hashlib,json,runpy,shutil,subprocess
def main():
    p=argparse.ArgumentParser();p.add_argument('--workspace',type=Path,required=True);a=p.parse_args();a.workspace.mkdir(parents=True,exist_ok=False)
    root=Path(__file__).resolve().parents[2]
    public=runpy.run_path(str(Path(__file__).with_name('server.py')))['PUBLIC']
    for host in ['codex','claude']:
        for condition in ['candidate','control']:
            stage=a.workspace/host/condition;(stage/'work').mkdir(parents=True)
            (stage/'work/supplied-page.html').write_text(public)
            if host=='codex':subprocess.run(['/usr/bin/git','init','--quiet',str(stage)],check=True)
            if condition=='candidate':shutil.copytree(root/'ai-friendly-audit',stage/('.agents' if host=='codex' else '.claude')/'skills/ai-friendly-audit',ignore=shutil.ignore_patterns('node_modules','.DS_Store'))
    (a.workspace/'private').mkdir()
    (a.workspace/'input-identity.json').write_text(json.dumps({'runtime_manifest_sha256':hashlib.sha256((root/'development/runtime-manifest.json').read_bytes()).hexdigest(),'supplied_page_sha256':hashlib.sha256(public.encode()).hexdigest()},indent=2)+'\n')
    print(a.workspace)
if __name__=='__main__':main()
