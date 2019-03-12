# WebRTC 远程视频会议
## coturn 只是一个示例，服务器上需要自己下载并配置turnserver.conf
```
git clone https://github.com/coturn/coturn.git  
创建并配置turnserver.conf  
turnserver -a -v --user ${username}:${password} -r=外网ip -X 外网ip -f --no-cli  
```

## signalmaster 服务端程序，主要用于客户端之间的交互以及数据传输
### config/development.json 可以使用谷歌的turn也可以使用自己的turn
### 程序运行
```
npm install  

node server.js  

```

## SimpleWebRTC 客户端程序，主要用于客户端的各种展示以及相关媒体操作实现
### config.js 需要根据自己的服务ip进行修改
```
//socket地址设置  

var port = "https://xxx:443";  

function getPort(){  

    return port;  
    
}  
```
### 程序运行
```
npm install  

npm run test-page  
```

## 配置nginx的SSL信息，将服务端和客户端指向于同一个端口443即可完成https的配置

## 访问地址 https://localhost/test/?2
## 项目示例测试地址 https://47.106.221.149/test/?2
