// pages/sociality/sociality.js
import {
  loadingOff,
  loadingOn,
  showToast,
  previewImage
} from '../../../../utils/util'
import {
  getAllDynamic,
  getAllDynamicByCampus,
  giveThunbUp,
  cancelThunbUp
} from '../../../../service/socialty'
import { 
  getAllPosters,
} from '../../../../service/home'
import {
  K_config,
  BASE_URL
} from '../../../../service/config'
// import { threadId } from 'worker_threads'
// const userId = wx.getStorageSync('userId')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toTop:null,
    isTriggered:false,
    swiperList: [],
    imgUrl: '',
    showImg: false,
    // 定位
    position:'',
    //文字内容
    contain:'我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人',
    containBreak:'',
    // 分页查询
    pageNum:1,
    pageSize:5,
    // 最大页数
    maxPages:1,
    // 校园圈列表
    dynamicList:[],
    baseurl : '',
    userId : wx.getStorageSync('userId'),
    //是否到达底部
    showEnd:true,
    // 是否登录
    isLogin : true,
    // 是否刷新
    isRefresh:false
  },
  tapBanner(e) {
    this.setData({
      showImg: true,
      imgUrl: e.currentTarget.dataset.url
    })
  },
  hideImg() {
    this.setData({
      showImg: false
    })
  },
  // 跳转登录页
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
  // 初始化数据
  initData:function(){
    this.data.dynamicList=[]
    this.data.pageNum = 1
  },
  // 点赞事件触发
  likeClick:function(e){
    let shareId = e.currentTarget.dataset.id
    let isLike = e.currentTarget.dataset.islike
    let userId = this.data.userId
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
  // 判断文字是否超出字符个数限制
  wordsJudge:function(contain,num){
      if(contain.length>num){
        return contain.slice(0,num-3)+"......"
      }
      else{
        return contain
      }
  },
  // 进入详情页
  toDynamicDetails:function(e){
      wx.navigateTo({
        url: '../dynamicDetails/dynamicDetails?item=' + JSON.stringify(e.currentTarget.dataset.item),
      })
  },
  // 进入发布动态页
  toReleaseDynamic:function(){
    wx.navigateTo({
      url: '../releaseDynamic/releaseDynamic',
    })
  },
  // 获取所有校区动态
  getAllCampusDynamic(){
    let pageNum = this.data.pageNum
    let pageSize = this.data.pageSize
    let userId = this.data.userId
    getAllDynamic(pageNum,pageSize,userId).then((res)=>{
      loadingOff()
      if(res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_getAllDynamic_SUCCESS){
        const list=[]
        let arr=res.data.data.list
        for(let i in arr){
            const dynamicInfo={
              auditStatus:arr[i].auditStatus,
              likeNumber:arr[i].likeNumber,
              schoolAddress:arr[i].schoolAddress,
              shareContent:this.wordsJudge(arr[i].shareContent,90),
              shareContentWhole:arr[i].shareContent,
              sharePicture:arr[i].sharePicture,
              shareTime:arr[i].shareTime,
              showTime:arr[i].shareTime.substring(2,10).replace(/-/g, '/'),
              shareId:arr[i].shareId,
              userId:arr[i].userId,
              nickName:arr[i].nickName,
              head:arr[i].head,
              isLike:arr[i].status,
              count:arr[i].count,
              commentList:[],
              index:(pageNum-1)*5+parseInt(i)
            }
            list.push(dynamicInfo)
        }
        this.data.dynamicList.push(...list)
        this.data.isTriggered=false
          this.setData({
            dynamicList:this.data.dynamicList,
            maxPages:res.data.data.pages,
            isTriggered:false,
            isRefresh:true
          })
          // console.log("aaaasasasasa");
      }
    })
  },
  //获取当前选择校区动态
  getDynamicByCampus(){
    let pageNum = this.data.pageNum
    let pageSize = this.data.pageSize
    let userId = this.data.userId
    let campusName = wx.getStorageSync('campusSocialName')
    getAllDynamicByCampus(campusName,pageNum,pageSize,userId).then((res)=>{
      loadingOff()
      if(res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_getAllDynamic_SUCCESS){
        const list=[]
        let arr=res.data.data.list
        for(let i in arr){
            const dynamicInfo={
              auditStatus:arr[i].auditStatus,
              likeNumber:arr[i].likeNumber,
              schoolAddress:arr[i].schoolAddress,
              shareContent:this.wordsJudge(arr[i].shareContent,90),
              shareContentFull:arr[i].shareContent,
              sharePicture:arr[i].sharePicture,
              shareTime:arr[i].shareTime,
              showTime:arr[i].shareTime.substring(2,10).replace(/-/g, '/'),
              shareId:arr[i].shareId,
              userId:arr[i].userId,
              nickName:arr[i].nickName,
              head:arr[i].head,
              isLike:arr[i].status,
              count:arr[i].count,
              commentList:[],
              index:i
            }
            list.push(dynamicInfo)
        }
        this.data.dynamicList.push(...list)
        this.setData({
          dynamicList:this.data.dynamicList,
          maxPages:res.data.data.pages,
          isTriggered:false
        })
          // console.log(this.data.dynamicList);
      }
    })
  },
  // 获取校区动态
  getDynamic:function(){
    if(wx.getStorageSync('campusSocialName')=='所有校区'){
      this.getAllCampusDynamic()
    }else{
      this.getDynamicByCampus()
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // if (wx.getStorageSync('token')) {
    //   this.setData({
    //     isLogin:true
    //   })    
    //   this.initData()
    //   this.getDynamic()
    // }

    wx.createSelectorQuery().select('.scrollTop').boundingClientRect().selectViewport().scrollOffset().exec(res => {
      // console.log(res); 
      this.setData({
        toTop: res[0].bottom * 2
      })
    })

    if(wx.getStorageSync('address') && wx.getStorageSync('token')) {
      getAllPosters({
        campus: wx.getStorageSync('address')
      }).then(res => {
        wx.hideLoading()
        this.setData({
          swiperList: res.data.data
        })
      })
    }
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
    if (!wx.getStorageSync('token')) {
      this.setData({
        isLogin: false,
      })
    }else{
      this.setData({
        isLogin: true,
        baseurl:BASE_URL,
        position: wx.getStorageSync('campusSocialName') || '定位',
        userId:wx.getStorageSync('userId')
      })
      if(!this.data.isRefresh){
        this.initData()
        this.getDynamic()
      }
    } 
  },

  // 下拉刷新
  toRefresh:function(){
    this.setData({
      isTriggered:true
    })
    this.initData()
    this.getDynamic()
  },
  // 上拉加载更多
  toLoading:function(){
    if(this.data.pageNum<this.data.maxPages){
      ++this.data.pageNum
      this.getDynamic()
      this.setData({
        showEnd:false
      })
    }else{
      this.setData({
        showEnd:true
      })
    }
   
  },
  // 查看图片
  _previewImage(e){
    previewImage( [e.currentTarget.dataset.image], e.currentTarget.dataset.image)
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