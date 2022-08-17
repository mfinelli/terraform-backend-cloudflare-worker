import { Hono } from 'hono'
// import { sentry } from '@honojs/sentry'

interface Env {
  TERRAFORM_STATE: KVNamespace
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
