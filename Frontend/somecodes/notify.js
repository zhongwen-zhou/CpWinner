  function notify(title, content) {  
            
          if(!title && !content){  
              title = "桌面提醒";  
              content = "您看到此条信息桌面提醒设置成功";  
          }  
          var iconUrl = "/images/send_ok.png";  
            
          if (window.webkitNotifications) {  
              //chrome老版本  
              if (window.webkitNotifications.checkPermission() == 0) {  
                  var notif = window.webkitNotifications.createNotification(iconUrl, title, content);  
                  notif.display = function() {}  
                  notif.onerror = function() {}  
                  notif.onclose = function() {}  
                  notif.onclick = function() {this.cancel();}  
                  notif.replaceId = 'Meteoric';  
                  notif.show();  
              } else {  
                  window.webkitNotifications.requestPermission($jy.notify);  
              }  
          }  
          else if("Notification" in window){  
              // 判断是否有权限  
              if (Notification.permission === "granted") {  
                  var notification = new Notification(title, {  
                      "icon": iconUrl,  
                      "body": content,  
                  });  
              }  
              //如果没权限，则请求权限  
              else if (Notification.permission !== 'denied') {  
                  Notification.requestPermission(function(permission) {  
                      // Whatever the user answers, we make sure we store the  
                      // information  
                      if (!('permission' in Notification)) {  
                          Notification.permission = permission;  
                      }  
                      //如果接受请求  
                      if (permission === "granted") {  
                          var notification = new Notification(title, {  
                              "icon": iconUrl,  
                              "body": content,  
                          });  
                      }  
                  });  
              }  
          }  
      }  


  function logAndNotify(gameName, playWay, key, value){
    console.error('['+gameName+'] '+playWay+', '+key+'---'+value+', 符合购买条件！');
    notify(gameName+'-'+playWay, key+'---'+value+', 符合购买条件！');
  }

  function logAndNotifyOpen(title, content){
    console.error('['+title+']-'+content);
    notify(title, content);
  }

  function parse11x5(data){
    console.log('=====分析任一=======');
    data = JSON.parse(data);
    var all = data['all'];
    for(var key in all){
      var value = all[key]['m'];
      console.log('分析:'+key+', 间隔值为：'+ value);
      if(value > GLOBAL_CONFIG.THRESHOLD['11x5']['r1']){
        logAndNotify(currentGame.name, '任一', key, value);
      } 
    }

    console.log('=====分析定位=======');

    var oneData = data['one'];
    for(var i = 0; i<oneData.length; i++){
      var data = oneData[i];
      console.log('分析第'+(i+1)+'位');
      for(var key in data){
        var value = data[key]['m'];
        if(i < 3 && value > GLOBAL_CONFIG.THRESHOLD['11x5']['dw']){
          logAndNotify(currentGame.name, '定位-'+(i+1), key, value);        
        }
      }
    }
  }

  function parsepk10(data){
    console.log('=====分析北京赛车定位=======');
    data = JSON.parse(data);
    var oneData = data['one'];
    for(var i = 0; i<oneData.length; i++){
      var data = oneData[i];
      console.log('分析第'+(i+1)+'位');
      for(var key in data){
        var value = data[key]['m'];
        if(value > GLOBAL_CONFIG.THRESHOLD['pk10']['dw']){
          logAndNotify('北京赛车', '定位-'+(i+1), key, value);
        }
      }
    }
  }

  var currentGame = null;
  var currentIndex = 7;

  var GLOBAL_CONFIG = {
    GAMES : {
      '6' :{
        id :6,
        name: '北京赛车',
        url: 'http://cbou1.diusx.com:880/z/gCAR-analyzeAjax',
        data: {gi : 6}
      },
      '7' :{
        id :7,
        name: '广东11选5',
        url: 'http://cbou1.diusx.com:880/z/gEE5-analyzeAjax',
        data: {gi : 7}      
      },
      '8' :{
        id: 8,
        name: '上海11选5',
        url: 'http://cbou1.diusx.com:880/z/gEE5-analyzeAjax',
        data: {gi : 8}      
      },
      '9' :{
        id: 9,
        name: '山东选5',
        url: 'http://cbou1.diusx.com:880/z/gEE5-analyzeAjax',
        data: {gi : 9}      
      },
      '10' :{
        id:10,
        name: '江西11选5',
        url: 'http://cbou1.diusx.com:880/z/gEE5-analyzeAjax',
        data: {gi : 10}      
      }
    },
    THRESHOLD : {
      '11x5' : {
        'r1' : 12,
        'dw' : 75
      },
      'pk10' : {
        'dw' : 80
      }
    }
  }


  function runPk10(){
      var game = GLOBAL_CONFIG.GAMES['6'];
      console.log('------'+new Date()+'-----开始分析北京赛车------------------');
      $.post(game.url,game.data, function(data){parsepk10(data)});  
  }

  function run11x5(){
      var games = GLOBAL_CONFIG.GAMES;
      currentGame = games[currentIndex];

      console.log('------'+new Date()+'----开始分析-----------'+currentGame['name']);    
      $.post(currentGame.url,currentGame.data, function(data){parse11x5(data)});    

      currentIndex++;
      if(currentIndex == 11){
        currentIndex = 7;
      }    
  }


  var monitorIds = {};

  var orderRecord = {};

  /**
   *  监控北京赛车游戏开奖情况
   *  monitorPk10OpenGame(4, 5);
   *  北京赛车-定位-第四名-5号车
   */
  function monitorPk10OpenGame(key, index, money){
    var monitorName = 'pk10-'+'dw-'+key+'-'+index;
    var game = GLOBAL_CONFIG.GAMES['6'];
    
    var records = orderRecord[monitorName];
    if(records){

    }else{
      orderRecord[monitorName] = [];
      records = orderRecord[monitorName];
    }

    var record = {
      name: game.name,
      playWay: '定位',
      key: key,
      index: index,
      money: money,
      order_at: new Date(),
      open_at: null,
      open_status : 'wait',
      remark: 'test'
    };

    records.push(record);
    monitorIds[monitorName] = setInterval(function(){
      $.post(game.url,game.data, function(data){
      console.log('跟踪'+game.name+' 定位 '+key+' - '+index+' 开奖情况');
        data = JSON.parse(data);
        var oneData = data['one'];
        var _resultData = oneData[key-1][index]['m'];
        if(_resultData == 0){
          logAndNotifyOpen('北京赛车 已开奖', key+'---'+index);
          clearInterval(monitorIds[monitorName]);
          delete(monitorIds[monitorName]);
          record.open_at = new Date();
          record.open_status = 'win'
        }
      });
    }, 1000 * 60 * 3);
  }

  /**
   *  监控11选5-任一-开奖情况
   *  monitor11x5R1(7, '09')
   *  广东11选5-任一-'09'号
   */
  function monitor11x5R1(game_id, key, money){
    var monitorName = '11x5-'+game_id+'-'+'r1-'+key;
    var game = GLOBAL_CONFIG.GAMES[game_id];

    var records = orderRecord[monitorName];
    if(records){

    }else{
      orderRecord[monitorName] = [];
      records = orderRecord[monitorName];
    }

    var record = {
      name: game.name,
      playWay: '任一',
      key: key,
      money: money,
      order_at: new Date(),
      open_at: null,
      open_status : 'wait',
      remark: 'test'
    };

    records.push(record);

    monitorIds[monitorName] = setInterval(function(){
      $.post(game.url,game.data, function(data){
      console.log('跟踪'+game.name+' 任一 '+key+' 开奖情况');
        data = JSON.parse(data);
        var _resultData = data['all'][key]['m'];
        if(_resultData == 0){
          logAndNotifyOpen(game.name+' 任一 已开奖', key);
          clearInterval(monitorIds[monitorName]);
          delete(monitorIds[monitorName]);
          record.open_at = new Date();
          record.open_status = 'win'          
        }   
      });
    }, 1000 * 60 * 5);
  }

  /**
   *  监控11选5-定位-开奖情况
   *  monitor11x5Dw(7, 3, '08')
   *  广东11选5-定位-第三名-'08'号
   */
  function monitor11x5Dw(game_id, key, index){
    var monitorName = '11x5-'+game_id+'-'+'dw-'+key+'-'+index;
    var game = GLOBAL_CONFIG.GAMES[game_id];


    var records = orderRecord[monitorName];
    if(records){

    }else{
      orderRecord[monitorName] = [];
      records = orderRecord[monitorName];
    }

    var record = {
      name: game.name,
      playWay: '定位',
      key: key,
      index: index,
      money: money,
      order_at: new Date(),
      open_at: null,
      open_status : 'wait',
      remark: 'test'
    };

    records.push(record);


    monitorIds[monitorName] = setInterval(function(){
      $.post(game.url,game.data, function(data){
      console.log('跟踪'+game.name+' 定位 '+key+' - '+index+' 开奖情况');
        data = JSON.parse(data);
        var _resultData = data['one'][key-1][index]['m'];
        if(_resultData == 0){
          logAndNotifyOpen(game.name+' 定位 '+key+' 已开奖', key+'-'+index);
          clearInterval(monitorIds[monitorName]);
          delete(monitorIds[monitorName]);
          record.open_at = new Date();
          record.open_status = 'win'          
        }   
      });
    }, 1000 * 60 * 5);
  }

  /**
   *  初始化，将购买记录重新加载
   *
   */
  function init(){
    var orderRecordStr = localStorage.getItem('orderRecord');
    if(orderRecord){
      orderRecord = JSON.parse(orderRecordStr);
    }
  }

  function startMonitor(){
    /**
     *  11选5主入口
     */
    setInterval(function(){
      run11x5();
    }, 1000 * 60 * 1);

    /**
     *  北京赛车主入口
     */
    setInterval(function(){
      runPk10();
    }, 1000 * 60 * 2);    

    /**
     *  定期存储购买记录
     *
     */
    setInterval(function(){
      saveToLocalDb();
    }, 1000 * 60 * 1);
  }


  function saveToLocalDb(){
    localStorage.setItem('orderRecord', JSON.stringify(orderRecord));  
  }


init();
startMonitor();