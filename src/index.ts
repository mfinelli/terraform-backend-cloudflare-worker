import { Hono } from 'hono'
// import { sentry } from '@honojs/sentry'

interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  SENTRY_DSN: string
}

const app = new Hono<Env>()

// app.use('*', sentry())

app.use('*', async (c, next) => {
  await next()
  // we never want cached responses for terraform state
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
  c.header('Cache-Control', 'no-store')
})


export default app
