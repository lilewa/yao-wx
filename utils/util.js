const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const myShowModal=obj=>{
  return new Promise((resolve, reject) => {
    obj.success = (res) => {
      if (res.confirm) 
        resolve(true);
      else if (res.cancel)
        resolve(false);
      }
    wx.showModal(obj);
  });
 
}
const isPage = (name)=>{
  let pages=getCurrentPages();
  let strs = pages[pages.length - 1].route.split('/');
  let pagename = strs[strs.length - 1];
  console.log(pagename);
  return pagename===name;
}
module.exports = {
  formatTime: formatTime,
  myShowModal: myShowModal,
  isPage: isPage
}
