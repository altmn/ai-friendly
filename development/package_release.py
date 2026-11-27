"""Build deterministic downloadable runtime and development archives."""
from pathlib import Path
import argparse
import hashlib
import json
import zipfile

parser=argparse.ArgumentParser()
parser.add_argument('--package-root',type=Path,required=True)
parser.add_argument('--out',type=Path,required=True)
args=parser.parse_args()
root=args.package_root.resolve()
dev=Path(__file__).resolve().parent
args.out.mkdir(parents=True,exist_ok=True)
stamp=(2026,11,22,0,0,0)

def checksum(data): return hashlib.sha256(data).hexdigest()
def archive(destination,entries):
    with zipfile.ZipFile(destination,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name,file in sorted(entries):
            if file.is_symlink(): raise ValueError(f'Symlink excluded: {file}')
            info=zipfile.ZipInfo(name,date_time=stamp)
            info.compress_type=zipfile.ZIP_DEFLATED
            info.create_system=3
            info.external_attr=(0o100755 if file.name=='audit.mjs' else 0o100644)<<16
            z.writestr(info,file.read_bytes())
    with zipfile.ZipFile(destination) as z:
        assert z.testzip() is None
    return {'filename':destination.name,'bytes':destination.stat().st_size,'sha256':checksum(destination.read_bytes()),'file_count':len(entries)}

runtime=[]
for file in root.rglob('*'):
    if not file.is_file():continue
    relative=file.relative_to(root)
    if any(part in {'node_modules','.git','__pycache__'} for part in relative.parts):continue
    if file.name.startswith('.'):continue
    runtime.append(('ai-friendly-audit/'+relative.as_posix(),file))
required=['LICENSE','NOTICE.md','SKILL.md','agents/openai.yaml','assets/module.json','assets/rules/frontend-v1.json','assets/report-template.md','package.json','package-lock.json','scripts/audit.mjs']
assert all((root/x).is_file() for x in required)
manifest={'version':'1.0.0','root_directory':'ai-friendly-audit','files':[{'path':name,'bytes':file.stat().st_size,'sha256':checksum(file.read_bytes())} for name,file in sorted(runtime)]}
(dev/'runtime-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
runtime_result=archive(args.out/'ai-friendly-audit-canonical-package-1.0.0.zip',runtime)

development=[]
for pattern in ['*.md','*.py','runtime-manifest.json','final-test-run.txt','tests/*.mjs','native_acceptance/*.py','native_acceptance/*.mjs','native_acceptance/README.md','fixtures/*.json','fixtures/*.html','examples/supplied-review/*.md','examples/supplied-review/*.json','examples/supplied-review/evidence/*']:
    for file in dev.glob(pattern):
        if file.is_file():development.append(('development/'+file.relative_to(dev).as_posix(),file))
development.extend((name, dev.parent/name) for name in ['LICENSE','NOTICE.md'])
development=list({name:file for name,file in development}.items())
dev_result=archive(args.out/'ai-friendly-audit-development-and-verification-1.0.0.zip',development)
print(json.dumps({'archives':[runtime_result,dev_result]},indent=2))
