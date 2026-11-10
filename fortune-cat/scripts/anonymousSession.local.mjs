import { spawn } from 'node:child_process'
import { cp, mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { createServer as createNetServer } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
export async function startPreview({port=5189,actualApp=false}={}) {
  const backend=path.resolve(app,'../../catbot/catbot-backend')
  const root=await realpath(await mkdtemp(path.join(os.tmpdir(),'catbot-anonymous-local-')))
  let child,server,exitCode=null
  async function stop(){await server?.close();if(child&&!child.killed)child.kill('SIGTERM');await rm(root,{recursive:true,force:true})}
  try {
    await new Promise((resolve,reject)=>{const probe=createNetServer();probe.once('error',()=>reject(Error('Port 8019 is already in use. Stop the earlier local preview first.')));probe.listen(8019,'127.0.0.1',()=>probe.close(resolve))})
    if (actualApp) {
      await cp(path.join(app,'src'),path.join(root,'src'),{recursive:true})
      await cp(path.join(app,'public'),path.join(root,'public'),{recursive:true})
      await cp(path.join(app,'scripts/app-preview'),path.join(root,'app-preview'),{recursive:true})
      await writeFile(path.join(root,'index.html'),`<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://127.0.0.1:8019 ws://127.0.0.1:*; img-src 'self' data: blob:; font-src 'self' data:; frame-src 'none'; form-action 'self'"><title>복냥사주 · 로컬 미리보기</title></head><body><div style="padding:5px 12px;background:#fff6df;font:12px sans-serif;text-align:center">로컬 미리보기 · 실제 결제/AI 호출 없음</div><div id="root"></div><script type="module" src="/app-preview/bootstrap.js"></script></body></html>`)
    } else {
      const files=['src/components/TossAccountGate.jsx','src/components/TossAccountGate.module.css','src/components/LegacyAccountRecovery.jsx','src/components/LegacyAccountRecovery.module.css','src/components/LibraryRecoveryHelp.jsx','src/components/LibraryRecoveryHelp.module.css','src/lib/tossAccount.js','src/lib/deepReadingAuth.js','src/lib/entryErrors.js','src/lib/tarotLibrary.js','src/lib/tarotConsultation.js','src/index.css','src/assets/images/hero.png']
      for(const file of files){await mkdir(path.dirname(path.join(root,file)),{recursive:true});await cp(path.join(app,file),path.join(root,file))}
      for(const file of ['session.js','fixture.jsx','preview.css'])await cp(path.join(app,'scripts/anonymous-preview',file),path.join(root,file))
      await writeFile(path.join(root,'index.html'),'<html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>복냥사주 익명 인증 로컬 MOCK</title><div id="root"></div><script type="module" src="/fixture.jsx"></script></html>')
      await writeFile(path.join(root,'insets.js'),'export const useSafeAreaInsets = () => ({ bottom: 34 })')
    }
    await symlink(path.join(app,'node_modules'),path.join(root,'node_modules'))
    child=spawn(path.join(backend,'venv/bin/python'),['scripts/anonymous_session_preview.py'],{cwd:backend,env:{PATH:process.env.PATH,HOME:process.env.HOME,LANG:'en_US.UTF-8'},stdio:['ignore','ignore','pipe']})
    let safeError=false;child.on('error',()=>{safeError=true});child.on('exit',code=>{exitCode=code??1});child.stderr.on('data',()=>{})
    let ready=false
    for(let i=0;i<100;i++) {if(safeError||exitCode!==null)throw Error('Local fixture backend failed to start. Check the backend venv and port 8019.');try{const r=await fetch('http://127.0.0.1:8019/health');if(r.ok&&(await r.json()).mock===true){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}
    if(!ready)throw Error('Local fixture backend startup timed out.')
    const aliases = actualApp ? [
      {find:'@apps-in-toss/web-framework',replacement:path.join(root,'app-preview/sdk.js')},
      {find:/^(?:\.\.\/|\.\/)lib\/supabase$/,replacement:path.join(root,'app-preview/catalog.js')},
      {find:/^(?:\.\.\/|\.\/)lib\/firebase$/,replacement:path.join(root,'app-preview/integrations.js')},
      {find:'./firebase',replacement:path.join(root,'app-preview/integrations.js')},
      {find:'@sentry/react',replacement:path.join(root,'app-preview/integrations.js')},
      {find:'../assets/images/cards',replacement:path.join(root,'app-preview/cards.js')},
    ] : [{find:'../lib/tossSession',replacement:path.join(root,'session.js')},{find:'../hooks/useSafeAreaInsets',replacement:path.join(root,'insets.js')}]
    server=await createServer({root,configFile:false,envDir:root,envPrefix:'__LOCAL_PREVIEW_NO_HOST_VARIABLES__',plugins:[react()],optimizeDeps:{entries:['index.html']},define:actualApp?{
      'import.meta.env.VITE_API_BASE_URL':JSON.stringify('http://127.0.0.1:8019'),
      'import.meta.env.VITE_SENTRY_DSN':JSON.stringify(''),
      'import.meta.env.VITE_DEEP_READING_PRODUCT_SKU':JSON.stringify('preview.deep'),
      'import.meta.env.VITE_FOLLOWUP_PACK_PRODUCT_SKU':JSON.stringify('preview.followup'),
    }:{},resolve:{alias:aliases},server:{host:'127.0.0.1',port,strictPort:true}})
    await server.listen()
    return {origin:`http://127.0.0.1:${server.httpServer.address().port}`,stop,root}
  }catch(error){await stop();throw error}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {const preview=await startPreview();console.log(`LOCAL MOCK only: ${preview.origin}\nNo production data or provider calls. Stop with Ctrl-C.`);for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await preview.stop();process.exit(0)})}catch(error){console.error(error.message);process.exitCode=1}
}
