"""Owned stdio Codex app-server sessions for controlled acceptance (no live config writes)."""
from pathlib import Path
import json,subprocess,time,shutil,os,signal,threading,queue,re

class Client:
    @staticmethod
    def completed_turn(data,thread_id,turn_id):
        return data.get('method')=='turn/completed' and data.get('params',{}).get('threadId')==thread_id and data.get('params',{}).get('turn',{}).get('id')==turn_id
    def __init__(self,cwd,log_path,extra_roots=(),disabled_skill_paths=(),disabled_mcp_names=(),reasoning_effort=None):
        self.binary=str(Path(shutil.which('codex')).resolve());self.log_path=Path(log_path);self.log_path.parent.mkdir(parents=True,exist_ok=True);self.log=self.log_path.open('w');self.next_id=0;self.pending=[]
        self.config={'features.skip_host_skill_discovery':True,'features.plugins':False,'features.apps':False,'features.memories':False,'project_doc_max_bytes':0}
        if reasoning_effort:self.config['model_reasoning_effort']=reasoning_effort
        cmd=[self.binary,'app-server','--stdio']
        for k,v in self.config.items():cmd+=['-c',k+'='+str(v).lower()]
        if disabled_mcp_names:
            inert=shutil.which('false')
            table='{'+','.join(json.dumps(name)+'={'+('url="http://127.0.0.1:9"' if kind=='http' else 'command='+json.dumps(inert))+',enabled=false}' for name,kind in disabled_mcp_names.items())+'}'
            cmd+=['-c','mcp_servers='+table]
        else:cmd+=['-c','mcp_servers={}']
        if disabled_skill_paths:
            table='['+','.join('{path='+json.dumps(p)+',enabled=false}' for p in disabled_skill_paths)+']'
            cmd+=['-c','skills.config='+table]
        self.stderr=self.log_path.with_suffix('.stderr').open('w')
        self.proc=subprocess.Popen(cmd,cwd=cwd,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=self.stderr,text=True,start_new_session=True,bufsize=1)
        self.queue=queue.Queue()
        def pump():
            for line in self.proc.stdout:
                try:self.queue.put(json.loads(line))
                except json.JSONDecodeError:pass
            self.queue.put({'_native_eof':True})
        self.reader=threading.Thread(target=pump,daemon=True);self.reader.start()
        try:
            self.call('initialize',{'clientInfo':{'name':'ai-friendly-isolated-acceptance','version':'2.0.0'},'capabilities':{'experimentalApi':True}})
            self.send({'method':'initialized','params':{}})
            self.call('skills/extraRoots/set',{'extraRoots':[str(Path(p).resolve()) for p in extra_roots]})
        except BaseException:
            self.close();raise
        self.disabled_mcp_count=None
    def send(self,data):self.proc.stdin.write(json.dumps(data)+'\n');self.proc.stdin.flush()
    def read(self,timeout=180):
        try:data=self.queue.get(timeout=timeout)
        except queue.Empty:raise TimeoutError('Native response deadline')
        if data.get('_native_eof'):raise RuntimeError('Native server exited; inspect private stderr.')
        self.log.write(json.dumps(data)+'\n');self.log.flush();return data
    @staticmethod
    def remaining(deadline):
        remaining=deadline-time.monotonic()
        if remaining<=0:raise TimeoutError('Native response deadline')
        return remaining
    def call(self,method,params,timeout=30):
        deadline=time.monotonic()+timeout
        self.next_id+=1;id=self.next_id;self.send({'id':id,'method':method,'params':params})
        while True:
            data=self.read(self.remaining(deadline))
            if data.get('id')==id:
                if 'error' in data:raise RuntimeError(method+': '+json.dumps(data['error']))
                return data['result']
            self.pending.append(data)
    def catalog(self,cwd):return self.call('skills/list',{'cwds':[str(Path(cwd).resolve())],'forceReload':True})
    def start(self,cwd):
        return self.call('thread/start',{'cwd':str(Path(cwd).resolve()),'ephemeral':True,'approvalPolicy':'never','sandbox':'read-only','config':self.config})
    def turn(self,thread_id,prompt,skill=None,timeout=180,output_schema=None):
        items=[{'type':'text','text':prompt}]
        if skill:items.append({'type':'skill','name':'ai-friendly-audit','path':str(Path(skill).resolve())})
        params={'threadId':thread_id,'input':items}
        if output_schema:params['outputSchema']=output_schema
        self.pending=[];start=time.time();events=[];end=time.monotonic()+timeout;result=None
        try:
            result=self.call('turn/start',params,timeout=self.remaining(end))
            while True:
                remaining=self.remaining(end)
                data=self.pending.pop(0) if self.pending else self.read(remaining)
                events.append(data)
                if self.completed_turn(data,thread_id,result['turn']['id']):
                    return {'turn_id':result['turn']['id'],'started_at_epoch':start,'elapsed_seconds':time.time()-start,'events':events,'completion':data['params']['turn']}
        except TimeoutError:
            try:
                if result:
                    self.next_id+=1
                    self.send({'id':self.next_id,'method':'turn/interrupt','params':{'threadId':thread_id,'turnId':result['turn']['id']}})
            finally:self.close()
            raise
    def compact(self,thread_id,timeout=180):
        self.pending=[];events=[];end=time.monotonic()+timeout;turn_id=None;item_done=False
        try:
            result=self.call('thread/compact/start',{'threadId':thread_id},timeout=self.remaining(end))
            while True:
                remaining=self.remaining(end)
                data=self.pending.pop(0) if self.pending else self.read(remaining);events.append(data)
                params=data.get('params',{})
                if params.get('threadId')!=thread_id:continue
                if params.get('item',{}).get('type')=='contextCompaction':
                    if data.get('method')=='item/started':turn_id=params.get('turnId')
                    if data.get('method')=='item/completed' and params.get('turnId')==turn_id:item_done=True
                if turn_id and item_done and self.completed_turn(data,thread_id,turn_id):return {'result':result,'events':events}
        except TimeoutError:
            self.close();raise
    def close(self):
        if self.proc.poll() is None:
            os.killpg(self.proc.pid,signal.SIGTERM)
            try:self.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:os.killpg(self.proc.pid,signal.SIGKILL);self.proc.wait()
        self.reader.join(timeout=1);self.log.close();self.stderr.close()
