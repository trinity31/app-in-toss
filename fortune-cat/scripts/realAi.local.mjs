import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { createServer as createNetServer } from 'node:net'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createServer } from 'vite'
import { realAiProxy } from './realAiProxy.local.mjs'

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const backend = path.resolve(app, '../../catbot/catbot-backend')
const origin = 'http://127.0.0.1:5190'
const key = randomBytes(32).toString('hex')
let child, server, stopping = false
async function stop() {
  if (stopping) return
  stopping = true
  await server?.close()
  child?.kill('SIGTERM')
}
try {
  for (const port of [5190, 8020]) await new Promise((resolve, reject) => {
    const probe = createNetServer()
    probe.once('error', () => reject(Error(`Port ${port} is in use`)))
    probe.listen(port, '127.0.0.1', () => probe.close(resolve))
  })
  child = spawn(path.join(backend, 'venv/bin/python'), [path.join(app, 'scripts/realAiBackend.local.py'), backend], {
    cwd: backend, env: { ...process.env, BFF_API_KEY: key }, stdio: ['ignore', 'inherit', 'inherit'],
  })
  let failed = false
  child.on('error', () => { failed = true })
  child.on('exit', () => { failed = true; if (!stopping) void stop() })
  let ready = false
  for (let i = 0; i < 600; i++) {
    if (failed) throw Error('Real AI backend failed to start')
    try { const response = await fetch('http://127.0.0.1:8020/health'); if (response.ok) { ready = true; break } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  if (!ready) throw Error('Real AI backend startup timed out')
  server = await createServer({
    root: app, configFile: path.join(app, 'vite.config.js'),
    define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(origin) },
    plugins: [{ name: 'local-real-ai', configureServer(vite) {
      vite.middlewares.use(realAiProxy({ origin, upstream: 'http://127.0.0.1:8020', key }))
    } }],
    server: { host: '127.0.0.1', port: 5190, strictPort: true },
  })
  await server.listen()
  console.log(`Real AI: ${origin}\nLocal test account; real AI charges and test records. No real payments. Stop with Ctrl-C.`)
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => void stop())
} catch (error) {
  console.error(error.message)
  await stop()
  process.exitCode = 1
}
