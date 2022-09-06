import app from '.'

const env = getMiniflareBindings()

// import { KVNamespace } from "@miniflare/kv";
// import { MemoryStorage } from "@miniflare/storage-memory";

// const { SENTRY_DSN, TERRAFORM_STATE } = getMiniflareBindings()
// const SENTRY_DSN = ''
// const TERRAFORM_STATE = new KVNamespace(new MemoryStorage());

describe('test root route', () => {
  it('it should return a 404', async () => {
    const res = await app.request('http://localhost/')
    expect(res.status).toBe(404)
  })

  it('should have the correct cache control header', async () => {
    const res = await app.request('http://localhost/')
    expect(res.headers.get('cache-control')).toBe('no-store')
  })
})

describe('test getting state', () => {
  describe('that does not exist', () => {
    it('should return an empty string', async () => {
      // app.Env = {
      //   SENTRY_DSN: SENTRY_DSN,
      //   TERRAFORM_STATE: TERRAFORM_STATE,
      // }
      // app.env.SENTRY_DSN = SENTRY_DSN
      // console.log(Object.getOwnPropertyNames(app));

      // const res = await app.request('http://localhost/newstate')
      // const res = await app.fetch(new Request(`https://localhost/newstate`), env)
      const res = await app.fetch(new Request('http://localhost/newstate'), env)
      expect(res.status).toBe(200)
      const body = await res.text();
      // expect(res.body).toBe('')
      expect(body).toBe('')
    })
  })

  describe('that exists', () => {
    it('should return the state object', async () => {
      await env.TERRAFORM_STATE.put('test', JSON.stringify({test: 'state'}))
      const res = await app.fetch(new Request('http://localhost/test'), env)
      expect(res.status).toBe(200)
      const body = await res.text();
      expect(body).toBe('{"test":"state"}')
    })
  })


})
