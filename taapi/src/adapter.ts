import { Execute } from '@chainlink/types'
import { Requester, Validator } from '@chainlink/external-adapter'
import { util } from '@chainlink/ea-bootstrap'

const customParams = {
  indicator: true,
  base: ['base', 'from', 'coin'],
  quote: ['quote', 'to', 'market'],
  exchange: true,
  interval: true,
}

export const execute: Execute = async (input) => {
  const validator = new Validator(input, customParams)
  if (validator.error) throw validator.error

  const jobRunID = validator.validated.id
  const indicator = validator.validated.data.indicator
  const url = `https://api.taapi.io/${indicator}`
  const base = validator.validated.data.base.toUpperCase()
  const quote = validator.validated.data.quote.toUpperCase()
  const symbol = `${base}/${quote}`
  const exchange = validator.validated.data.exchange
  const interval = validator.validated.data.interval
  const secret = util.getRandomRequiredEnv('API_KEY')

  const params = {
    secret,
    exchange,
    symbol,
    interval,
  }

  const config = {
    url,
    params,
  }

  try {
    const { data } = await Requester.request(config)
    data.result = Requester.validateResultNumber(data, ['value'])
    return Requester.success(jobRunID, {
      data,
      result: data.result,
      status: 200,
    })
  } catch (err) {
    return Requester.errored(jobRunID, err.message)
  }
}
