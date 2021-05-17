// pages/WCH/remarks/remarks.js
import {
  BASE_URL
} from '../../../service/config'

Page({
  data: {
    // 单选标签
    audioTag: [
      {
        tag: '不加辣',
        check: false
      },
      {
        tag: '少点辣',
        check: false
      },
      {
        tag: '多点辣',
        check: false
      }
    ],
    // 多选标签
    tagList: [
      {
        tag: '不要香菜',
        check: false
      },
      {
        tag: '不要洋葱',
        check: false
      },
      {
        tag: '不要葱',
        check: false
      },
      {
        tag: '不吃蒜',
        check: false
      }
    ],
    // 备注信息
    textareaValue: '',
    // 标签选择列表
    valueArr: []
  },
  onShow: function () {
    let eventChannel = this.getOpenerEventChannel()
    eventChannel.on('editRemark', (data) => {
      for(let item of data.remarkObj.audioTag) {
        if(item.check) {
          this.data.valueArr.push(item.tag)
        }
      }
      for(let item of data.remarkObj.tagList) {
        if(item.check) {
          this.data.valueArr.push(item.tag)
        }
      }

      this.setData({
        audioTag: data.remarkObj.audioTag,
        tagList: data.remarkObj.tagList,
        textareaValue: data.remarkObj.textareaValue
      })
    })
  },
  textareaInput(e) {
    this.setData({
      textareaValue: e.detail.value
    })
  },
  chooseTag(e) {
    // 点击第几个标签
    const index = e.currentTarget.dataset.index;
    
    // 未选择
    if(!this.data.tagList[index].check) {
      this.data.valueArr.push(this.data.tagList[index].tag)
    } else {
      // 已选择
      let tag = this.data.valueArr.indexOf(this.data.tagList[index].tag)
      this.data.valueArr.splice(tag, 1)
    }

    this.data.tagList[index].check = !this.data.tagList[index].check

    this.setData({
      textareaValue: this.data.textareaValue,
      tagList: this.data.tagList
    })
  },
  chooseAudioTag(e) {
    // 点击第几个标签
    const index = e.currentTarget.dataset.index;
    // 获取标签列表
    let audioList = e.currentTarget.dataset.taglist
    // 获取标签列表名字
    let ListName = e.currentTarget.dataset.listname

    // 单选
    for(let item of audioList) {
      if((audioList.indexOf(item) == index) && !audioList[index].check) {
        item.check = true
        this.data.valueArr.push(audioList[index].tag)
      } else {
        // 其他的不勾选
        item.check = false
        let tag = this.data.valueArr.indexOf(item.tag)
        
        // 若存在就删除
        if(tag != -1) {
          this.data.valueArr.splice(tag, 1)
        }
      }
    }

    this.setData({
      textareaValue: this.data.textareaValue,
      [ListName]: audioList
    })
  },
  finishRemark() {
    let pages = getCurrentPages()
    let lastPage = pages[pages.length - 2]
    // 备注
    let list = ''
    for(let tag in this.data.valueArr) {
      list = list + this.data.valueArr[tag] + '；'
    }
    // 删去最后一个分号
    list = list.substring(0, list.length - 1)
    
    // 备注和标签拼接在一起
    const remark = this.data.textareaValue + (this.data.textareaValue?'；':'') + list

    if(!!lastPage && lastPage.route === 'pages/WCH/bill/bill') {
      // 把备注对象传出去存储，以防二次编辑
      lastPage.data.remarkObj = {
        textareaValue: this.data.textareaValue,
        audioTag: this.data.audioTag,
        tagList: this.data.tagList
      }
      // 更新备注
      lastPage.setData({
        remark: remark
      })
      wx.navigateBack()
    }
  },
  onShareAppMessage(options) {
    return {
      title: '啰咪校园',
      path: '/pages/WCH/home/home',
      imageUrl: BASE_URL + '/images/logo.png'
    }
  }
})