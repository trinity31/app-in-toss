import { startPreview } from './anonymousSession.local.mjs'
try {
  const preview=await startPreview({actualApp:true})
  console.log(`Actual Catbot app UI, local adapters only: ${preview.origin}\nNo production data, real AI or payment calls. Stop with Ctrl-C.`)
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await preview.stop();process.exit(0)})
}catch(error){console.error(error.message);process.exitCode=1}
