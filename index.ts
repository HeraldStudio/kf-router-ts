import glob from "glob"
import path from "path"
import chalk from "chalk"
import { Context } from "koa"
const unixify = (fn: String) => fn.replace(/\\/g, '/')
const safeAssign = (a: any, b: any) => {
  if (typeof a === 'object' && typeof b === 'object' && a != null && b != null) {
    for (let key in b) if (!(key in a)) a[key] = b[key]
  }
}

declare module "koa" {
  interface Request {
    body?: any;
    rawBody: string;
  }
}

export default (rootPath = 'routes') => {
  let rootModule = module
  while (rootModule.parent) {
    rootModule = rootModule.parent
  }
  const root = path.join(path.dirname(rootModule.filename), rootPath)
  let modules = {} as any
  glob.sync(root + '/**/*.ts', {}).map(f => {
    let absolute = path.resolve(f)
    let relative = unixify(absolute.replace(root, '').replace(/\.ts$/, ''))
    let mod = require(absolute)
    if (typeof mod === 'object' && mod.hasOwnProperty('default')) {
      modules[relative] = mod
    } else {
      console.log('kf-router [W] Loaded module without export default: ' + chalk.yellow(relative))
    }
  }).find(k => k)

  let requireRoute = (route: string) => {
    route = route.replace(/\/$/, '')
    if (modules.hasOwnProperty(route)) {
      return modules[route]
    } else if (modules.hasOwnProperty(route + '/index')) {
      modules[route] = modules[route + '/index']
      return modules[route]
    } else {
      return null
    }
  }

  return async (ctx: Context) => {
    let [route, method] = [ctx.path, ctx.method.toLowerCase()]
    let handler = requireRoute(route)
    if (!handler) {
      ctx.throw(404)
    }
    let routeObj = handler.default
    if (!routeObj) {
      ctx.throw(404)
    }
    if (!routeObj.hasOwnProperty(method)) {
      ctx.throw(405)
    }
    let params
    // supports koa-bodyparser
    if (typeof ctx.request.body === 'object' || typeof ctx.request.body === 'undefined') {
      params = {}
      Object.assign(params, ctx.request.body || {})
      Object.assign(params, ctx.query || {})
    } else {
      params = ctx.request.body || {}
    }
    // inject properties of routeObj (only those not formerly defined in ctx) into ctx
    safeAssign(ctx, routeObj)

    // does not handle errors
    // pass through to upstream instead
    let res = await routeObj[method].call(ctx, params)
    if (res) {
      ctx.body = res
    }
  }
}
