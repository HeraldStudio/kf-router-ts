import koa from 'koa'
const app: koa = new koa()
// const kf = require('../index')
import kf from '../index'
const port = 3001

import Axios, { AxiosInstance } from 'axios'
import params from './middleware/params'
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

app.use(params)
app.use(kf())
app.listen(port)

const assertRoute = async (method: String, route: String, expect: any, params?: object) => {
  let actual = (await axios[method.toLowerCase()](route, params)).data
  // console.log(actual, route)
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
  await assertRoute('POST', '/invalidParam', { param1: 3, param2: '321', param3: { a: 1 } }, { param1: 3, param2: '321', param3: { a: 1 } })
  console.log('Passed')
  process.exit(0)
}
test()
