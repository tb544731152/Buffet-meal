let city = require('../../utils/city.js');
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    city: "郑州",
    isHidden: true,
    searchLettrt: [],
    showLettrt: "",
    winHeight: 0,
    tHeight: 0,
    bHeight: 0,
    startPageY: 0,
    isShowLetter: false,
    scrollTop: 0,
    isLogin: true,
    name: '',
    isFilter: true,
    citys: [],
    map: {
      longitude: 0,
      latitude: 0,
      markersL: [],
      polyline: [],
      circles: [],
      controls: [],
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.loginName) {
      this.setData({
        name: app.globalData.loginName,
        isLogin: false,
      })
    }
    let cityArr = ['上海', '北京', '郑州'];
    this.setData({
      cityArr: cityArr   //设置热门城市
    });
    let searchLetter = city.searchLetter;  //城市字母列表
    let cityList = city.cityList();       //城市列表
    let sysInfo = wx.getSystemInfoSync(); //获取系统信息同步接口
    let winHeight = sysInfo.windowHeight; //可使用窗口高度
    let itemH = (winHeight - 100) / searchLetter.length;
    let tempObj = [];
    for (let i = 0; i < searchLetter.length; i++) {
      let temp = {};
      temp.name = searchLetter[i];
      temp.tHeight = i * itemH;
      temp.bHeight = (i + 1) * itemH;
      tempObj.push(temp);
    }
    this.setData({
      winHeight: winHeight - 120,
      itemH: itemH,
      searchLetter: tempObj,
      cityList: cityList
    });
    this.getMap();
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  cityselect: function () {
    this.setData({
      isHidden: false,
    })
  },
  searchLetterStart: function (event) {
    let showLetter = event.currentTarget.dataset.letter;
    let pageY = event.touches[0].pageY;
    this.setScrollTop(this, showLetter);
    this.nowLetter(pageY, this);
    this.setData({
      showLetter: showLetter,
      startPageY: pageY,
      isShowLetter: true,
    })
  },
  searchLetterMove: function (event) {
    let pageY = event.touches[0].pageY;
    let startPageY = this.data.startPageY;
    let tHeight = this.data.tHeight;
    let bHeight = this.data.bHeight;
    var showLetter = 0;
    if (startPageY - pageY > 0) {
      if (pageY < tHeight) {
        this.nowLetter(pageY, this);
      }
    } else {
      if (pageY > bHeight) {
        this.nowLetter(pageY, this);
      }
    }
  },
  searchLetterEnd: function (event) {
    let that = this;
    setTimeout(function () {
      that.setData({
        isShowLetter: false
      })
    }, 1000)
  },
  setScrollTop: function (that, showLetter) {
    let scrollTop = 0;
    let cityList = that.data.cityList;
    let cityCount = 0;
    let initialCount = 0;
    for (let i = 0; i < cityList.length; i++) {
      if (showLetter == cityList[i].initial) {
        scrollTop = initialCount * 30 + cityCount * 41;
        break;
      } else {
        initialCount++;
        cityCount += cityList[i].cityInfo.length;
      }
    }
    that.setData({
      scrollTop: scrollTop - 1558
    })
  },
  nowLetter: function (pageY, that) {
    let letterData = this.data.searchLetter;
    let bHeight = 0;
    let tHeight = 0;
    let showLetter = "";
    for (let i = 0; i < letterData.length; i++) {
      if (letterData[i].tHeight <= pageY && pageY <= letterData[i].bHeight) {
        bHeight = letterData[i].bHeight;
        tHeight = letterData[i].tHeight;
        showLetter = letterData[i].name;
        break;
      }
    }
    this.setScrollTop(that, showLetter);
    that.setData({
      bHeight: bHeight,
      tHeight: tHeight,
      showLetter: showLetter,
      startPageY: pageY
    })
  },
  selectCity: function (event) {
    let city = event.target.dataset.city;
    this.setData({
      city: city,
      isHidden: true,
    });
  },
  goLogin: function (event) {
    wx.navigateTo({
      url: '../login/login',
    })
  },
  closeCity: function (event) {
    this.setData({
      isHidden: true,
    })
  },
  searchCity: function (event) {
    let citys = [];
    this.data.cityList.forEach(val => {
      citys.push(...val.cityInfo);
    });
    let allCityList = [];
    citys.forEach(v => {
      allCityList.push(v.city);
    })
    if (event.detail.value) {
      this.setData({
        isFilter: false,
      })
      let value = event.detail.value;
      allCityList = allCityList.filter(val => {
        return val.indexOf(value) > -1 && val.indexOf(value) === 0;
      })
      this.setData({
        citys: allCityList,
      })
    } else {
      this.setData({
        isFilter: true,
      })
    }
  },
  goMenu: function (event) {
    wx.navigateTo({
      url: '../menu/menu',
    })
  },
  getMap: function () {
    let that = this;
    wx.getLocation({
      success: function (res) {
        that.setData({
          map: {
            latitude: res.latitude,
            longitude: res.longitude,
            markers: [{
              id: 1,
              latitude: res.latitude,
              longitude: res.longitude,
              title: 'home',
              iconPath: '../../images/icon/position.svg',
              width: 50,
              height: 50
            }]
          }
        })
        console.log('data', that.data);
      },
    })
  }
})