import koa from 'koa'
const app: koa = new koa()
// const kf = require('../index')
import kf from '../index'
const port = 3001

import Axios, { AxiosInstance } from 'axios'

declare module 'axios' {
  interface AxiosInstance {
    [key: string]: any,
  }
}

const axios: AxiosInstance = Axios.create({
  baseURL: `http://localhost:${port}`,
  validateStatus: () => true
})

process.on('unhandledRejection', e => { throw e })
process.on('uncaughtException', console.trace)

app.use(kf())
app.listen(port)

const assertRoute = async (method: String, route: String, expect: String) => {
  let actual = (await axios[method.toLowerCase()](route)).data
  if (typeof actual !== 'string') {
    actual = JSON.stringify(actual)
  }
  if (typeof expect !== 'string') {
    expect = JSON.stringify(expect)
  }
  if (actual !== expect) {
    throw new Error(`Assertion failed: ${route}, returned: ${actual}, expected: ${expect}`)
  }
}

let test = async () => {
  await assertRoute('GET', '/', 'GET / [index.js]')
  await assertRoute('POST', '/', 'POST / [index.js]')
  await assertRoute('PUT', '/', 'PUT / [index.js]')
  await assertRoute('DELETE', '/', 'DELETE / [index.js]')
  await assertRoute('GET', '/nothing', 'Not Found')
  console.log('Passed')
  process.exit(0)
}
test()
