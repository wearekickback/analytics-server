const got = require('got')
const cors = require('@koa/cors')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const globalTunnel = require('global-tunnel-ng')

const { PROXY } = process.env

if (PROXY) {
  const [ host, port ] = PROXY.split(':')
  console.log(`Proxying all requests through ${host}:${port}`)
  globalTunnel.initialize({ host, port })
}

const MIXPANEL_API_URL = 'https://api.mixpanel.com'
const MIXPANEL_JS_LIB_URL = 'http://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js'

const CODE_CACHE = new Map()

const init = async () => {
  console.log(`Downloading JS lib from: ${MIXPANEL_JS_LIB_URL}`)

  const { body: mixpanelJs } = await got(MIXPANEL_JS_LIB_URL)

  const app = new Koa()
  const router = new KoaRouter()

  app.use(cors({
    credentials: true,
  }))

  router.get('/client.js', async ctx => {
    const { origin } = ctx

    if (!CODE_CACHE[origin]) {
      CODE_CACHE[origin] = mixpanelJs.replace(MIXPANEL_API_URL, origin.substr(origin.indexOf('://') + 1))
    }

    ctx.body = CODE_CACHE[origin]
  })

  router.get('/favicon.ico', async ctx => {
    ctx.body = ''
  })

  router.get('*', async ctx => {
    const { origin, href } = ctx
    const newUrl = `${MIXPANEL_API_URL}${href.substr(origin.length)}`

    const headers = {
      ...ctx.headers,
      'X-Forwarded-For': ctx.ip
    }
    delete headers.host

    const { body, statusCode, rawHeaders } = await got(newUrl, {
      headers,
      ...(PROXY ? { agent: false } : null)
    })

    ctx.body = body
    ctx.status = statusCode
    ctx.headers = rawHeaders
  })

  app.use(router.routes())
  app.use(router.allowedMethods())

  const PORT = process.env.PORT || 3000

  app.listen(PORT, () => {
    console.log(`Running on http://127.0.0.1:${PORT}`)
  })
}

init().catch(err => {
  console.error(err)
  process.exit(-1)
})
