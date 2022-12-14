import { Hono } from 'hono'
import Toucan from 'toucan-js'
// import { sentry } from '@honojs/sentry'
//

import { Bindings } from './bindings'

// export interface Env {
//   TERRAFORM_STATE: KVNamespace
//   TERRAFORM_STATE_LOCKS: KVNamespace
//   SENTRY_DSN: string
// }

const app = new Hono<{ Bindings: Bindings }>()

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
  if (state) {
    return c.json(JSON.parse(state))
  } else {
    return c.text('')
  }
})

app.post('/:name', async (c) => {
  const stateName = c.req.param('name')
  const body = await c.req.json()
  await c.env.TERRAFORM_STATE.put(stateName, JSON.stringify(body))
  return c.json(body)
})

app.put('/:name/lock', async (c) => {
  const stateName = c.req.param('name')
  const lock = await c.env.TERRAFORM_STATE_LOCKS.get(stateName)
  if (lock) {
    return c.json(JSON.parse(lock), 423)
  } else {
    const body = await c.req.json()
    await c.env.TERRAFORM_STATE_LOCKS.put(stateName, JSON.stringify(body))
    return c.json(body)
  }
})

// for some unkown reason unlock doesn't work when the method is DELETE -
// it always returns a 400 event before we get into the function call where
// we can log anything... switching to post works without any other changes
// so i'm leaving it for now and will change it if i can ever figure out why
// (strangely calling force-unlock works without issue, only the automatic
// unlock after a plan or apply causes the error)
// app.delete('/:name/lock', async (c) => {
app.post('/:name/lock', async (c) => {
  const stateName = c.req.param('name')
  // console.log(stateName)
  // const lock = await c.env.TERRAFORM_STATE_LOCKS.get(stateName)
  const resp = await c.env.TERRAFORM_STATE_LOCKS.delete(stateName)
  return c.text('')
})

export default app
