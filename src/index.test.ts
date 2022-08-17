import app from '.'

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
