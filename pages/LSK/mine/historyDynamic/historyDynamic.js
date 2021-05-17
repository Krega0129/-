// pages/LSK/mine/historyDynamic/historyDynamic.js
import {
  loadingOff,
  loadingOn,
  showToast,
  previewImage
} from '../../../../utils/util'
import {
  getDynamicById,
  getDynamicByStatus,
  giveThunbUp,
  cancelThunbUp
} from '../../../../service/socialty'
import {
  K_config,
  BASE_URL
} from '../../../../service/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toTop: null,
    isTriggered: false,
    TabCur: 0,
    scrollLeft: 0,
    modalName: '',
    currentType: 'all',
    TabName: ["已通过", "未通过", "待审核"],
    // 通过审核
    dynamicList: [],
    // 未通过审核
    auditNoPassList: [],
    // 未审核
    unauditedList: [],
    // 分页查询
    pageNumByPass: 1,
    pageNumByNoPass: 1,
    pageNumByunaudited: 1,
    pageSize: 10,
    // 最大页数
    maxPagesByPass: 1,
    maxPagesByNoPass: 1,
    maxPagesByunaudited: 1,
    // 校园圈列表
    dynamicList: [],
    baseurl: '',
    //是否到达底部
    showEndByPass: false,
    showEndByNoPass: false,
    showEndByunaudited: false,
    // 需要删除的动态的index
    deleteIndex:null,
    isLogin: true,
    isRefresh: false
  },
  // 是否登录
  toLogin: function () {
    wx.login({
      success: res => {
        const code = res.code
        wx.navigateTo({
          url: '/pages/WCH/login/login',
          success: res => {
            res.eventChannel.emit('code',{ code: code })
          }
        })
      }
    })  
  },
  // 选项卡展示
  tabSelect(e) {
    const index = e.currentTarget.dataset.id
    this.setData({
      TabCur: index,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
    // console.log(this.data.TabCur);

    if (wx.getStorageSync('token')) {
      if (index === 0) {
        if (this.data.pageNumByPass === 1) {
          this.data.dynamicList = []
          this.getAuditPassList()
        }
      } else if (index === 1) {
        if (this.data.pageNumByNoPass === 1) {
          this.data.auditNoPassList = []
          this.getDynamicListByStatus()
        }
      } else if (index === 2) {
        if (this.data.pageNumByunaudited === 1) {
          this.data.unauditedList = []
          this.getDynamicListByStatus()
        }
      }
    }

  },
  // 进入详情页
  toDynamicDetails:function(e){
    if(this.data.TabCur===0){
      wx.navigateTo({
        url: '../../sociality/dynamicDetails/dynamicDetails?item=' + JSON.stringify(e.currentTarget.dataset.item)
      })
    }else{
      wx.navigateTo({
        url: '../dynamicDetail/dynamicDetail?item=' + JSON.stringify(e.currentTarget.dataset.item)
      })
    }
  },
  // 判断文字是否超出字符个数限制
  wordsJudge: function (contain, num) {
    if (contain.length > num) {
      return contain.slice(0, num - 3) + "......"
    }
    else {
      return contain
    }
  },
  // 初始化数据
  initData: function () {
    switch (this.data.TabCur) {
      case 0:
        this.data.dynamicList = []
        this.data.pageNumByPass = 1
        this.getAuditPassList()
        break;
      case 1:
        this.data.auditNoPassList = []
        this.data.pageNumByNoPass = 1
        this.getAuditNoPassList()
        break;
      case 2:
        this.data.unauditedList = []
        this.data.pageNumByunaudited = 1
        this.getUnauditedList()
        break;
    }
  },
  // 返回时刷新页面
  refreshPage:function(){
    let index = this.data.deleteIndex
    switch (this.data.TabCur) {
      case 0:
        let list = this.data.dynamicList
        list.splice(index,1)
        list = this.formatIndex(index,list)
        if(this.data.pageNumByPass < this.data.maxPagesByPass){
          list.splice((this.data.pageNumByPass-1)*10,9)
          this.setData({
            dynamicList:list
          })
          this.getAuditPassList()
        }else{
          this.setData({
            dynamicList:list
          })
        }
        break;
      case 1:
        list = this.data.auditNoPassList
        list.splice(index,1)
        list = this.formatIndex(index,list)
        if(this.data.pageNumByNoPass < this.data.maxPagesByNoPass){
          list.splice((this.data.pageNumByNoPass-1)*10,9)
          this.setData({
            auditNoPassList:list
          })
          this.getAuditNoPassList()
        }else{
          this.setData({
            auditNoPassList:list
          })
        }
        console.log(index);
        break;
      case 2:
        list = this.data.unauditedList
        list.splice(index,1)
        list = this.formatIndex(index,list)
        if(this.data.pageNumByunaudited < this.data.maxPagesByunaudited){
          list.splice((this.data.pageNumByunaudited-1)*10,9)
          this.setData({
            unauditedList:list
          })
          this.getUnauditedList()
        }else{
          this.setData({
            unauditedList:list
          })
        }
        break;
    }
  },
  formatIndex:function(i,list){
    for(i;i<list.length;i++){
      list[i].index=list[i].index-1
    }
    return list
  },
  // 点赞
  likeClick:function(e){
    let shareId = e.currentTarget.dataset.id
    let userId = wx.getStorageSync('userId')
    let isLike = e.currentTarget.dataset.islike
    console.log(isLike);
    if(!isLike){
      giveThunbUp(shareId,userId).then((res)=>{
        loadingOff()
        if(res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_giveThumbUp_SUCCESS){
          showToast('点赞成功',1000)
          // let item = this.data.dynamicList.find(res => res.shareId === shareId)
          // console.log(item);
          let dynamicList=this.data.dynamicList
          for (let index = 0; index < dynamicList.length; index++) {
            if (shareId === dynamicList[index].shareId) {
              dynamicList[index].likeNumber=dynamicList[index].likeNumber+1
              dynamicList[index].isLike=1
              console.log(dynamicList[index].likeNumber);
            }
          }
          this.setData({
            dynamicList:dynamicList
          })
        }
      })
    }
    else{
      cancelThunbUp(shareId,userId).then((res)=>{
        loadingOff()
        if(res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_cancelThumbUp_SUCCESS){
          showToast('取消点赞成功',1000)
          // let item = this.data.dynamicList.find(res => res.shareId === shareId)
          // console.log(item);
          let dynamicList=this.data.dynamicList
          for (let index = 0; index < dynamicList.length; index++) {
            if (shareId === dynamicList[index].shareId) {
              dynamicList[index].likeNumber=dynamicList[index].likeNumber-1
              dynamicList[index].isLike=0
              console.log(dynamicList[index].likeNumber);
            }
          }
          this.setData({
            dynamicList:dynamicList
          })
        }
      })
    }
  },
  // 获取已审核动态
  getAuditPassList() {
    getDynamicById({
      pageNum: this.data.pageNumByPass,
      pageSize: this.data.pageSize,
      userId: wx.getStorageSync('userId')
    }).then((res) => {
      loadingOff()
      console.log(res);
      if (res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_getDynamicById_SUCCESS) {
        const list = []
        let arr = res.data.data.list
        for (let i in arr) {
          const dynamicInfo = {
            auditStatus: arr[i].auditStatus,
            likeNumber: arr[i].likeNumber,
            schoolAddress: arr[i].schoolAddress,
            shareContent: this.wordsJudge(arr[i].shareContent, 90),
            shareContentWhole:arr[i].shareContent,
            sharePicture: arr[i].sharePicture,
            shareTime: arr[i].shareTime,
            showTime: arr[i].shareTime.substring(2, 10).replace(/-/g, '/'),
            shareId: arr[i].shareId,
            userId: arr[i].userId,
            nickName: arr[i].nickName,
            head: arr[i].head,
            isLike: arr[i].status,
            count: arr[i].count,
            commentList: [],
            index: (this.data.pageNumByPass - 1) * 10 + parseInt(i)
          }
          list.push(dynamicInfo)
        }
        console.log(list);

        this.data.dynamicList.push(...list)
        this.data.isTriggered = false
        if(res.data.data.pages===1){
          this.setData({
            showEndByPass:true
          })
        }
        this.setData({
          dynamicList: this.data.dynamicList,
          maxPagesByPass: res.data.data.pages,
          isTriggered: false,
          isRefresh:true
        })
        // console.log(this.data.dynamicList);
      }
    })
  },
  // 根据审核状态获取动态
  getDynamicListByStatus() {
    switch (this.data.TabCur) {
      case 1:
        // console.log(1);
        this.getAuditNoPassList()
        break;
      case 2:
        // console.log(2);
        this.getUnauditedList()
        break;
    }
  },
  // 获取未通过审核动态
  getAuditNoPassList() {
    getDynamicByStatus({
      auditStatus: 0,
      pageNum: this.data.pageNumByNoPass,
      pageSize: this.data.pageSize,
      userId: wx.getStorageSync('userId')
    }).then((res) => {
      loadingOff()
      console.log(res);
      if (res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_getDynamicByStatus_SUCCESS) {
        const list = []
        let arr = res.data.data.list
        for (let i in arr) {
          const dynamicInfo = {
            auditStatus: arr[i].auditStatus,
            // likeNumber: arr[i].likeNumber,
            schoolAddress: arr[i].schoolAddress,
            shareContent: this.wordsJudge(arr[i].shareContent, 90),
            shareContentWhole:arr[i].shareContent,
            sharePicture: arr[i].sharePicture,
            shareTime: arr[i].shareTime,
            showTime: arr[i].shareTime.substring(2, 10).replace(/-/g, '/'),
            shareId: arr[i].shareId,
            userId: arr[i].userId,
            nickName: arr[i].nickName,
            head: arr[i].head,
            isLike: arr[i].status,
            // count: arr[i].count,
            commentList: [],
            index: (this.data.pageNumByNoPass - 1) * 10 + parseInt(i)
          }
          list.push(dynamicInfo)
        }
        // console.log(list);

        this.data.auditNoPassList.push(...list)
        this.data.isTriggered = false
        if(res.data.data.pages===1){
          this.setData({
            showEndByNoPass:true
          })
        }
        this.setData({
          auditNoPassList: this.data.auditNoPassList,
          maxPagesByNoPass: res.data.data.pages,
          isTriggered: false
        })
        // console.log(this.data.dynamicList);
      }

    })
  },
  // 获取未审核动态
  getUnauditedList() {
    getDynamicByStatus({
      auditStatus: 2,
      pageNum: this.data.pageNumByunaudited,
      pageSize: this.data.pageSize,
      userId: wx.getStorageSync('userId')
    }).then((res) => {
      loadingOff()
      console.log(res);
      if (res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_getDynamicByStatus_SUCCESS) {
        const list = []
        let arr = res.data.data.list
        for (let i in arr) {
          const dynamicInfo = {
            auditStatus: arr[i].auditStatus,
            // likeNumber: arr[i].likeNumber,
            schoolAddress: arr[i].schoolAddress,
            shareContent: this.wordsJudge(arr[i].shareContent, 90),
            shareContentWhole:arr[i].shareContent,
            sharePicture: arr[i].sharePicture,
            shareTime: arr[i].shareTime,
            showTime: arr[i].shareTime.substring(2, 10).replace(/-/g, '/'),
            shareId: arr[i].shareId,
            userId: arr[i].userId,
            nickName: arr[i].nickName,
            head: arr[i].head,
            isLike: arr[i].status,
            // count: arr[i].count,
            commentList: [],
            index: (this.data.pageNumByunaudited - 1) * 10 + parseInt(i)
          }
          list.push(dynamicInfo)
        }
        console.log(list);

        this.data.unauditedList.push(...list)
        this.data.isTriggered = false
        if(res.data.data.pages===1){
          this.setData({
            showEndByunaudited:true
          })
        }
        this.setData({
          unauditedList: this.data.unauditedList,
          maxPagesByunaudited: res.data.data.pages,
          isTriggered: false
        })
        // console.log(this.data.dynamicList);
      }

    })
  },
  // 查看图片
  _previewImage(e){
    console.log(e.currentTarget.dataset.image);
    previewImage( [e.currentTarget.dataset.image], e.currentTarget.dataset.image)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      baseurl: BASE_URL,
      // position: wx.getStorageSync('campusSocialName') || '定位'
    })
    wx.createSelectorQuery().select('.scrollTop').boundingClientRect().selectViewport().scrollOffset().exec(res => {
      // console.log(res); 
      this.setData({
        toTop: res[0].bottom * 2
      })
    })
    // this.getAuditPassList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(!wx.getStorageSync('token')){
      this.setData({
        isLogin:false
      })    
    }else{
      if(!this.data.isRefresh){
        this.getAuditPassList()
      }
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  // 下拉刷新
  toRefresh: function () {
    this.setData({
      isTriggered: true
    })
    this.initData()
  },
  // 上拉加载更多
  toLoading: function () {
    switch (this.data.TabCur) {
      case 0:
        if (this.data.pageNumByPass < this.data.maxPagesByPass) {
          ++this.data.pageNumByPass
          this.getAuditPassList()
          this.setData({
            showEndByPass: false
          })
        } else {
          this.setData({
            showEndByPass: true
          })
        }
        break;
      case 1:
        if (this.data.pageNumByNoPass < this.data.maxPagesByNoPass) {
          ++this.data.pageNumByNoPass
          this.getAuditNoPassList()
          this.setData({
            showEndByNoPass: false
          })
        } else {
          this.setData({
            showEndByNoPass: true
          })
        }
        break;
      case 2:
        if (this.data.pageNumByunaudited < this.data.maxPagesByunaudited) {
          ++this.data.pageNumByunaudited
          this.getUnauditedList()
          this.setData({
            showEndByunaudited: false
          })
        } else {
          this.setData({
            showEndByunaudited: true
          })
        }
        break;
    }


  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(options) {
    return {
      title: '啰咪校园',
      path: '/pages/WCH/home/home',
      imageUrl: BASE_URL + '/images/logo.png'
    }
  }
})