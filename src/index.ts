import { Hono } from 'hono'
import Toucan from 'toucan-js'
// import { sentry } from '@honojs/sentry'

interface Env {
  TERRAFORM_STATE: KVNamespace
  SENTRY_DSN: string
}

const app = new Hono<Env>()

// app.use('*', sentry())

app.onError((err, c) => {
  console.error(`${err}`)
  const sentry = new Toucan({
    dsn: c.env.SENTRY_DSN,
    context: c.executionCtx,
    request: c.req,
    allowedHeaders: ['user-agent'],
    allowedSearchParams: /(.*)/,
  })
  sentry.captureException(err)
  return c.text('Internal Server Error', 500)
})

app.use('*', async (c, next) => {
  await next()
  // we never want cached responses for terraform state
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
  c.header('Cache-Control', 'no-store')
})


export default app
