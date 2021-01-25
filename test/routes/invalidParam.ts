interface postParams {
  param1: string,
  param2: number,
  param3: object
}
export default {
  async post({ param1, param2, param3 }: postParams) {
    console.log(param1, param2, param3)
    return { param1, param2, param3 }
  }
}