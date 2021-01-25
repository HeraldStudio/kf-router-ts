/**
  # 参数解析中间件

  将 GET/DELETE 的 query 与 POST/PUT 的 body 合并成 ctx.params API。
  这里使用更严格的 HTTP 规范，GET/DELETE 不读 body，POST/PUT 不读 URL query。

  ## 依赖接口

  ctx.request.body    from koa-bodyparser

  ## 暴露接口

  ctx.params          object
 */
import bodyparser from "koa-bodyparser"
import { Context, Next } from "koa"

export default async (ctx: Context, next: Next) => {
  await bodyparser({
    enableTypes: ['json', 'form', 'text']
  })(ctx, async () => {
    if (/^get|delete$/i.test(ctx.method)) {
      ctx.params = ctx.query
    } else {
      ctx.params = ctx.request.body
    }
  }).catch((e: any) => {
    ctx.params = e.body
  })
  await next()
}
