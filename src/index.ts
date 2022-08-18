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

app.get('/:name', async (c) => {
  const stateName = c.req.param('name')
  const state = await c.env.TERRAFORM_STATE.get(stateName)
  // return c.json(state)
  if (state) {
    return c.json(JSON.parse(state))
  } else {
    return c.text(null)
  }
})

app.post('/:name', async (c) => {
  const stateName = c.req.param('name')
  const body = await c.req.parseBody()
  console.log(body)
  await c.env.TERRAFORM_STATE.put(stateName, JSON.stringify(body))
  return c.json(body)
})

export default app
