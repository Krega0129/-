import { showToast } from "./util"

export class HeartBeat {
  constructor(url, getMessage, connectMessage,  heartCheckMessage) {
    this.url = url
    this.ws = null
    this.getMessage = getMessage // 回调函数
    this.lockConnect = false
    this.timer = null
    this.timeout = 5000
    this.connectMessage = connectMessage
    this.heartCheckMessage =  heartCheckMessage
    this.heartCheck = {
      timeout: 10000,
      timeoutObj: null,
      serverTimeoutObj: null,
      /**
       * 定时器重置
       */
      reset() {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this
      },
      start(ws) {
        this.timeoutObj = setTimeout(() => {
            console.log(heartCheckMessage);
            ws.send({
              data: heartCheckMessage,
            })
            this.serverTimeoutObj = setTimeout(() => {
              console.log(ws);
              ws.close({code: 1000});
              console.log(2);
            }, this.timeout)
        }, this.timeout);
      }
    };
    this.initWebSocket()
  }

  initWebSocket() {
    try {
      this.creatWebSocket().then(res => {
        this.init()
      })
    } catch (error) {
      this.reconnect()
    }
  } 

  init() {
    this.ws.onClose((res) => {
      console.log('ws连接关闭');
      this.reconnect()
    })
    this.ws.onError((error) => {
      console.log('ws发生异常');
      this.reconnect()
    })
    this.ws.onOpen((result) => {
      console.log('open', result);
      console.log(this.connectMessage);
      // 心跳检测重置
      this.ws.send({
        data: JSON.stringify(this.connectMessage),
        success: (res) => {
          console.log('send', res);
        }
      })
      this.heartCheck.reset().start(this.ws)
    })
    this.ws.onMessage((res) => {
      console.log('message', res);
      if(res.data === 'pong') {
        this.heartCheck.reset().start(this.ws)
      }else{
        this.getMessage(res)
      }
    })
  }
  reconnect() {
    if(this.lockConnect) return
    this.lockConnect = true
    this.timer &&  clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.initWebSocket()
      this.lockConnect = false
    }, this.timeout)
  }

  creatWebSocket() {
    return new Promise(resolve => {
      this.ws = wx.connectSocket({
        url: this.url,
        timeout: 2000,
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          resolve(res)
        },
        fail: () => {
          showToast('订单实时更新失效，请重新进入小程序')
        }
      })
    })
  }
}