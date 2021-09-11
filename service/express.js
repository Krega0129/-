import request from './network'

import {
  H_config
} from './config'

export function selectExpressAgentPrice(data) {
  return request({
    url: H_config.API_selectExpressAgentPrice_URL,
    data: data
  })
}

export function submitNewForm(data) {
  return request({
    url: H_config.API_submitNewForm_URL,
    method: 'post',
    data: data
  })
}

export function selectUserOrder(data) {
  return request({
    url: H_config.API_selectUserOrder_URL,
    method: 'post',
    data: data
  })
}

export function getOrderNumber() {
  return request({
    url: H_config.API_getOrderNumber_URL
  })
}

export function payExpress(data) {
  return request({
    url: H_config.API_payExpress_URL,
    method: 'post',
    data: data
  })
}

// 取消订单
export function cancelExpressOrder(data) {
  return request({
    url: H_config.API_cancelExpressOrder_URL,
    method: 'post',
    data: data,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}