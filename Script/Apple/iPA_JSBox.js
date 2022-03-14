/*
- iOS14 IPA辅助安装器 (需与Surge配合使用)
-
- Surge模块地址: https://raw.githubusercontent.com/NobyDa/Script/master/Surge/Module/IPA_install.sgmodule
-
- 支持文件分享安装
- 支持主程序运行选择文件安装
- 安装完成后请返回运行界面选择后续操作
- 原作者：https://t.me/axel_burks
*/

var port_number = 8080
var plist_url = "itms-services://?action=download-manifest&url=https://x.io/install/jsbox"

// 从应用内启动
if ($app.env == $env.app) {
  $drive.open({
    handler: function(data) {
      fileCheck(data)
    }
  })
}
// 从 Action Entension 启动
else if ($app.env == $env.action) {
  fileCheck($context.data)
}

else {
  $ui.error("不支持此方式运行！")
  delayClose(2)
}


function startServer(port) {
  $http.startServer({
    port: port,
    path: "",
    handler: function(result) {
      //var url = result.url
    }
  })
}

function fileCheck(data) {
  if (data && data.fileName) {
    var fileName = data.fileName;
    if (fileName.indexOf(".ipa") == -1) {
      $ui.error(fileName + "非 ipa 文件！")
      delayClose(2)
    } else {
      install(fileName, data);
    }
  }
}

function install(fileName, file) {
  var result = $file.write({
    data: file,
    path: "app.ipa"
  })
  if (result) {
    startServer(port_number)
    var preResult = $app.openURL(plist_url);
    if (preResult) {
      $ui.alert({
        title: "正在安装…",
        message: "\n" + fileName + "\n\n请返回桌面查看进度\n\n安装完成后请返回\n\n点击\"安装完成\"按钮",
        actions: [{
          title: "取消",
          style: "Cancel",
          handler: function() {
            $http.stopServer()
            $file.delete("app.ipa")
            delayClose(0.2)
          }
        },
        {
          title: "安装完成",
          handler: function() {
            $http.stopServer()
            $file.delete("app.ipa")
            delayClose(0.2)
          }
        }]
      })
    } else {
      $ui.alert({
        title: "安装启动失败",
        message: "请重新运行此脚本",
        actions: [{
          title: "OK",
          style: "Cancel",
          handler: function() {
            delayClose(0.2)
          }
        }]
      })
    }
  } else {
    $ui.alert({
      title: "导入失败",
      message: "请重新运行此脚本",
      actions: [{
        title: "OK",
        style: "Cancel",
        handler: function() {
          delayClose(0.2)
        }
      }]
    })
  }
}

function delayClose(time) {
    $thread.main({
      delay: time,
      handler: function() {
        if ($app.env == $env.action || $app.env == $env.safari) {
          $context.close()
        }
        $app.close()
      }
    })
}