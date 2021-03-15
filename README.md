# 游密科技 WebRTC SDK for HTML5

本 SDK 对 WebRTC 和游密信令服务器、游密 turn 服务器进行统一封装，开发者申请了游密 appKey 后，使用本 SDK 即可简单快速地实现实时视频和实时语音功能。

**兼容说明**

操作系统平台 |浏览器/webview|版本要求|备注
-------|------|------|------
iOS|Safari(Only)|11.1.2| app内置WebView不支持
Android|4.4 (KitKat)、微信/手Q | TBS	43600 |
Android|Android	Chrome 60+ | 60+ |
Mac|Safari 11+、Chrome 内核	47+、Firefox 57+| * |
Windows(PC)|Chrome	47+、Firefox 57+、IE+Flash、Edge| * |

## 用法

使用本 SDK 只要四步。

### 第一步：引入 js 文件

** 直接引入 `ymrtc.min.js`：

```html
<script src="path/to/ymrtc.min.js"></script>
```

### 第二步：初始化

本 SDK 只有一个类：`YMRTC`，只要实例化这个类，就可以使用本 SDK 的全部功能。

若使用**方法一**直接引入 js 文件，可以直接访问 `YMRTC` 类：

```javascript
var rtc = new YMRTC({
    appKey: '[您所申请的 appKey 字符串]',
    video: true,  // true 为视频+语音通讯，false 为仅语音通讯
    debug: true,  // 开启debug日志
    dev: true     // 使用测试环境
});
```

本 SDK 同时支持 CommonJS 或 AMD 标准，除了上述直接引用，也可以使用这些标准方法初始化：

```javascript
// CommonJS 规范
var YMRTC = require('path/to/ymrtc.min.js');
var rtc = new YMRTC({
    appKey: '[您所申请的 appKey 字符串]',
    video: true,  // true 为视频+语音通讯，false 为仅语音通讯
    debug: true,  // 开启debug日志
    dev: true     // 使用测试环境
});
```

或者

```javascript
// AMD 规范
require(['path/to/ymrtc.min.js'], function(YMRTC) {
    var rtc = new YMRTC({
        appKey: '[您所申请的 appKey 字符串]',
        video: true  // true 为视频+语音通讯，false 为仅语音通讯
        debug: true,  // 开启debug日志
        dev: true     // 使用测试环境
    });
});
```

或者，若使用 ES6 或 TypeScript，可以使用 `import`：

```javascript
import YMRTC from 'path/to/ymrtc.min';

const rtc = new YMRTC({
    appKey: '[您所申请的 appKey 字符串]',
    video: true  // true 为视频+语音通讯，false 为仅语音通讯
});
```

或者，若使用**方法二**使用 npm 引入，则使用本 SDK 的 npm 名称：

```typescript
import YMRTC from 'youme-webrtc';

const rtc = new YMRTC({
    appKey: '[您所申请的 appKey 字符串]',
    video: true  // true 为视频+语音通讯，false 为仅语音通讯
});
```

### 第三步：用户登录、加入房间、初始化本地媒体（本地摄像头和麦克风）

```javascript
// 登录
rtc.login('[用户id]', '[token]');
// 加入房间，会自动等待登录成功再加入房间
rtc.joinRoom('[房间号，支持数字、字母、下划线组合]');
// 初始化本地媒体，然后把本地媒体放入 <video>（或 <audio>）
ymrtc.startLocalMedia({
                video: 'stdres' 
                }).catch((err) => {
                    if (err.name === 'NotAllowedError') {
                        alert('浏览器禁用了摄像头和麦克风的访问权限，或者页面没有使用 https 协议，请检查设置。');
                    } else if (err.name === 'NotFoundError') {
                        alert('没有找到摄像头或麦克风，请检查它们的连接。');
                    } else {
                        alert(err.name);
                    }
                });
```

更多控制 API 请参看下文的 API 文档，亦可以参看示例代码。

### 第四步：监听事件，播放其他用户传来的视频和语音

```javascript
// 当房间有人加入，或者当你自己刚刚加入了房间
rtc.on('room.member-join:[房间号]', function (roomId, memberIdList) {
    // memberIdList 为用户ID数组
    memberIdList.forEach(function(memberId) {
        // 监听该位用户的媒体流(stream)变化，若有变则用 <video> （或 <audio>）播放该流
        rtc.on('user.update-stream:' + memberId, function(mId, stream) {
            // 此处省略为该用户新建 <video> 标签的代码
            document.getElementById('[用户 mId 所属 <video> 标签的 id]').srcObject = stream;
        });
    });
});

// 当房间有人退出
rtc.on('room.member-leave:[房间号]', function (roomId, memberId) {
    // memberId 为离开房间的用户ID
    // 此处省略删除该用户所属的 <video> 标签的代码
});

// 事件监听：本地媒体状态，自己的媒体状态
ymrtc.on('local-media.status:*', function (eventFullName, status) {
    E('local-media-status').innerHTML = status;
});
ymrtc.on('local-media.has-stream', function (stream) {
    //显示自己的视频画面
    E('local-media').style.display = 'inline-block';
    E('local-media').srcObject = stream;
    E('local-media-start-stop').innerHTML = '停止';
});
ymrtc.on('local-media.remove-stream', function () {
    E('local-media').style.display = 'none';
    E('local-media-start-stop').innerHTML = '启动';
});
```

本 SDK 含有丰富的事件，并支持“*”通配符来描述一组事件名称。更多事件请参看下文的 API 文档，亦可以参看示例代码。

## 事件机制

本 SDK 提供丰富的事件接口，方便满足不同的需求。同时本 SDK 支持后缀通配符“*”以匹配多种事件。

以上文提及的**成员媒体流更新**事件 `user.update-stream:[成员ID]` 为例，假设需要监听的成员ID名称为 `zhang3`，那么事件名称就是 `user.update-stream:zhang3`。我们可以使用 `on` 接口监听这个事件：

```javascript
ymrtc.on('user.update-stream:zhang3', function(memberId, stream) {
    console.log(memberId); // "zhang3"
    console.log(stream);   // [Object]
});
```

事件名称支持后缀通配符“*”。假设你需要监听所有成员的媒体流更新，可以这么写：

```javascript
ymrtc.on('user.update-stream:*', function(eventFullName, memberId, stream) {
    console.log(eventFullName); // "user.update-stream:zhang3"
    console.log(memberId); // "zhang3"
    console.log(stream);   // [Object]
});
```

如上述代码所示，若使用了通配符，那么回调函数中**第一个参数将会传入这个事件的完整名称**。从第二个参数开始才是事件参数。

如果需要监听所有事件，也可以这么写：

```javascript
ymrtc.on('*', function(eventFullName) {
    console.log(eventFullName); // 事件完整名称，例如 "user.update-stream:zhang3"
    console.log(arguments);  // Array [事件完整名称, 事件参数1, 事件参数2, ...]
});
```

**注：事件名称仅支持把通配符放在最后。** 例如 `user.*:zhang3` 是不能识别的。

本 SDK 在事件名称的设计上多数采用了 `[事件分类].[事件名称]:[某个重要参数]` 的格式，以方便后缀通配符的使用。

# API 文档

以下是完整的 API 文档。
## 类 (class)

<dl>
<dt><a href="#YMRTC">YMRTC</a></dt>
<dd><p>YMRTC</p></dd>
</dl>

## 自定义类型 (typedef)

<dl>
<dt><a href="#InitConfig">InitConfig</a> : <code>Object</code></dt>
<dd><p>初始化 YIM 对象的配置</p></dd>
<dt><a href="#MediaConfig">MediaConfig</a> : <code>Object</code></dt>
<dd><p>初始化 YIM 对象的配置</p></dd>
<dt><a href="#MediaStats">MediaStats</a> : <code>Object</code></dt>
<dd><p>初始化 YIM 对象的配置</p></dd>
<dt><a href="#YoumeMemberChangeUser">YoumeMemberChangeUser</a> : <code>Object</code></dt>
<dd><p>member-change事件中的用户信息</p></dd>
<dt><a href="#YoumeOnReceiveMessage">YoumeOnReceiveMessage</a> : <code>Object</code></dt>
<dd><p>服务端广播的自定义消息</p></dd>
</dl>

<a name="YMRTC"></a>

## YMRTC
<p>YMRTC</p>

**类型**: 全局类(class)  

* [YMRTC](#YMRTC)
    * [new YMRTC(config)](#new_YMRTC_new)
    * [.pauseSubscribe(userId, options)](#YMRTC+pauseSubscribe) ⇒ <code>Promise</code>
    * [.resumeSubscribe(userId, options)](#YMRTC+resumeSubscribe) ⇒ <code>Promise</code>
    * [.getPauseSubscribeStatus(userId)](#YMRTC+getPauseSubscribeStatus) ⇒ <code>MediaSubscribePauseStatus</code>
    * [.setLocalAudioVolumeGain(gain)](#YMRTC+setLocalAudioVolumeGain)
    * [.getDeviceList(config)](#YMRTC+getDeviceList)
    * [.getAllDevices()](#YMRTC+getAllDevices) ⇒
    * [.setOutputDevice(mediaObject, deviceID)](#YMRTC+setOutputDevice)
    * [.screenRequestSourceList(type)](#YMRTC+screenRequestSourceList)
    * ["event:room.on-recive-message:[roomId]"](#YMRTC+event_room.on-recive-message_[roomId])
    * _信令服务器连接_
        * ["event:signaling.status:[status]"](#YMRTC+event_signaling.status_[status])
        * ["event:signaling.ready"](#YMRTC+event_signaling.ready)
    * _成员控制_
        * [.requestUserStream(userId)](#YMRTC+requestUserStream) ⇒ <code>Promise</code>
        * [.getMute(userId)](#YMRTC+getMute) ⇒ <code>boolean</code>
        * [.setMute(userId, isMuted)](#YMRTC+setMute)
        * [.setAllMute(isMuted)](#YMRTC+setAllMute)
        * ["event:user.ice-status:[memberId]:[status]"](#YMRTC+event_user.ice-status_[memberId]_[status])
        * ["event:user.signaling-status:[memberId]:[status]"](#YMRTC+event_user.signaling-status_[memberId]_[status])
        * ["event:user.update-stream:[memberId]"](#YMRTC+event_user.update-stream_[memberId])
        * ["event:user.remove-stream:[memberId]"](#YMRTC+event_user.remove-stream_[memberId])
        * ["event:user.media-stats-update:[memberId]"](#YMRTC+event_user.media-stats-update_[memberId])
        * ["event:user.pause-subscribe:[memberId]"](#YMRTC+event_user.pause-subscribe_[memberId])
        * ["event:user.resume-subscribe:[memberId]"](#YMRTC+event_user.resume-subscribe_[memberId])
    * _房间控制_
        * [.joinRoom(roomId, codec)](#YMRTC+joinRoom) ⇒ <code>Promise</code>
        * [.leaveRoom([roomId])](#YMRTC+leaveRoom)
        * [.inRoom(roomId)](#YMRTC+inRoom) ⇒ <code>boolean</code>
        * [.getRoomIdList()](#YMRTC+getRoomIdList) ⇒ <code>Array.&lt;string&gt;</code>
        * [.getRoomMemberIdList(roomId)](#YMRTC+getRoomMemberIdList) ⇒ <code>Array.&lt;string&gt;</code>
        * [.getRoomMediaStats(roomId)](#YMRTC+getRoomMediaStats) ⇒ [<code>MediaStats</code>](#MediaStats) \| <code>null</code>
        * [.getUserMediaStats(userId)](#YMRTC+getUserMediaStats) ⇒ [<code>MediaStats</code>](#MediaStats) \| <code>null</code>
        * ["event:room.update:[roomId]"](#YMRTC+event_room.update_[roomId])
        * ["event:room.member-join:[roomId]"](#YMRTC+event_room.member-join_[roomId])
        * ["event:room.member-leave:[roomId]"](#YMRTC+event_room.member-leave_[roomId])
        * ["event:room.join:[roomId]"](#YMRTC+event_room.join_[roomId])
        * ["event:room.leave:[roomId]"](#YMRTC+event_room.leave_[roomId])
        * ["event:room.media-stats-update:[roomId]"](#YMRTC+event_room.media-stats-update_[roomId])
        * ["event:room.other-mic-off:[roomId]"](#YMRTC+event_room.other-mic-off_[roomId])
        * ["event:room.other-mic-on:[roomId]"](#YMRTC+event_room.other-mic-on_[roomId])
        * ["event:room.other-video-input-start:[roomId]"](#YMRTC+event_room.other-video-input-start_[roomId])
        * ["event:room.other-video-input-stop:[roomId]"](#YMRTC+event_room.other-video-input-stop_[roomId])
        * ["event:room.others-speaker-off:[roomId]"](#YMRTC+event_room.others-speaker-off_[roomId])
        * ["event:room.others-speaker-on:[roomId]"](#YMRTC+event_room.others-speaker-on_[roomId])
        * ["event:room.member-change:[roomId]"](#YMRTC+event_room.member-change_[roomId])
    * _本地媒体控制_
        * [.startLocalMedia([mediaConfig])](#YMRTC+startLocalMedia) ⇒ <code>Promise</code>
        * [.pauseLocalMedia()](#YMRTC+pauseLocalMedia)
        * [.pauseLocalVideo()](#YMRTC+pauseLocalVideo)
        * [.pauseLocalAudio()](#YMRTC+pauseLocalAudio)
        * [.resumeLocalMedia()](#YMRTC+resumeLocalMedia)
        * [.resumeLocalVideo()](#YMRTC+resumeLocalVideo)
        * [.resumeLocalAudio()](#YMRTC+resumeLocalAudio)
        * [.isLocalVideoPaused()](#YMRTC+isLocalVideoPaused) ⇒ <code>boolean</code>
        * [.isLocalAudioPaused()](#YMRTC+isLocalAudioPaused) ⇒ <code>boolean</code>
        * [.stopLocalMedia()](#YMRTC+stopLocalMedia)
        * [.getLocalMediaStatus()](#YMRTC+getLocalMediaStatus) ⇒ <code>string</code>
        * [.requestLocalMediaStream()](#YMRTC+requestLocalMediaStream) ⇒ <code>Promise</code>
        * ["event:local-media.status:[status]"](#YMRTC+event_local-media.status_[status])
        * ["event:local-media.has-stream"](#YMRTC+event_local-media.has-stream)
        * ["event:local-media.remove-stream"](#YMRTC+event_local-media.remove-stream)
        * ["event:local-media.pause-video"](#YMRTC+event_local-media.pause-video)
        * ["event:local-media.pause-audio"](#YMRTC+event_local-media.pause-audio)
        * ["event:local-media.resume-video"](#YMRTC+event_local-media.resume-video)
        * ["event:local-media.resume-audio"](#YMRTC+event_local-media.resume-audio)
    * _用户帐户控制_
        * [.login(userId, token)](#YMRTC+login) ⇒ <code>Promise</code>
        * [.logout()](#YMRTC+logout)
        * [.getMyUserId()](#YMRTC+getMyUserId) ⇒ <code>string</code>
        * ["event:account.logged"](#YMRTC+event_account.logged)
        * ["event:account.logging"](#YMRTC+event_account.logging)
        * ["event:account.logout"](#YMRTC+event_account.logout)

<a name="new_YMRTC_new"></a>

### new YMRTC(config)
<p>游密WEBRTCSDK</p>


| 参数 | 类型 | 描述 |
| --- | --- | --- |
| config | [<code>InitConfig</code>](#InitConfig) | <p>配置</p> |

<a name="YMRTC+pauseSubscribe"></a>

### ymrtC.pauseSubscribe(userId, options) ⇒ <code>Promise</code>
<p>异步请求暂停订阅一个成员的媒体流，暂停订阅后服务端将不会发送该用户的媒体流</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**完成回调**: <code>void</code> - 暂停成功  
**拒绝回调**: <code>void</code> - 暂停失败，可能该用户不存在会议中  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| userId | <code>string</code> | <p>成员ID,可选参数，不传值则通过all的方式暂停订阅所有用户的流</p> |
| options | <code>string</code> | <p>&quot;audio&quot; | &quot;video&quot; | &quot;all&quot;; 暂停订阅类型，可选参数, all暂停订阅视频和音频流, video暂停订阅视频流， audio暂停订阅音频流, 不传值等价all</p> |

<a name="YMRTC+resumeSubscribe"></a>

### ymrtC.resumeSubscribe(userId, options) ⇒ <code>Promise</code>
<p>异步请求恢复订阅一个成员的媒体流，恢复订阅后服务端将会发送该用户的流媒体</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**完成回调**: <code>void</code> - 恢复订阅成功  
**拒绝回调**: <code>void</code> - 恢复订阅失败,可能该用户不在会议中  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| userId | <code>string</code> | <p>成员ID,可选参数，不传值则通过all的方式恢复订阅所有用户的流</p> |
| options | <code>string</code> | <p>&quot;audio&quot; | &quot;video&quot; | &quot;all&quot;; 恢复订阅类型，可选参数, all恢复订阅视频和音频流, video恢复阅视频流， audio恢复订阅音频流, 不传值等价all</p> |

<a name="YMRTC+getPauseSubscribeStatus"></a>

### ymrtC.getPauseSubscribeStatus(userId) ⇒ <code>MediaSubscribePauseStatus</code>
<p>获取一个成员的暂停订阅状态</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: <code>MediaSubscribePauseStatus</code> - <p>是否取处于消订阅该用户流媒体的状态, 默认处于未订阅状态</p>  

| 参数 | 描述 |
| --- | --- |
| userId | <p>成员ID</p> |

<a name="YMRTC+setLocalAudioVolumeGain"></a>

### ymrtC.setLocalAudioVolumeGain(gain)
<p>录音音量增益控制</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  

| 参数 | 描述 |
| --- | --- |
| gain | <p>声音增益，范围 0 - 2.0 表示从0% 到 200% 的录音增益</p> |

<a name="YMRTC+getDeviceList"></a>

### ymrtC.getDeviceList(config)
<p>获取所有设备列表, 必须在login之后调用</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| config | <code>object</code> | <p>可以设置{ audio: true, video: true } ,指定获取哪些类型的设备列表</p> |

<a name="YMRTC+getAllDevices"></a>

### ymrtC.getAllDevices() ⇒
<p>获取所有设备列表, 必须在login之后调用</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: <p>'audioInput'获取音频输入设备，'videoInput'获取视频输入设备,'audioOutput'音频输出设备</p>  
<a name="YMRTC+setOutputDevice"></a>

### ymrtC.setOutputDevice(mediaObject, deviceID)
<p>设置声音输出设备</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  

| 参数 | 描述 |
| --- | --- |
| mediaObject | <p>video或者audio的html对象</p> |
| deviceID | <p>选择的设备id</p> |

<a name="YMRTC+screenRequestSourceList"></a>

### ymrtC.screenRequestSourceList(type)
<p>获取屏幕共享源（仅Electron）</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| type | <code>Array.&lt;string&gt;</code> | <p>屏幕共享源类型数组，数组元素可选值 'screen'（整屏）、'window'（窗口）</p> |

<a name="YMRTC+event_room.on-recive-message_[roomId]"></a>

### "event:room.on-recive-message:[roomId]"
<p>服务端广播消息事件。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| msg | [<code>YoumeOnReceiveMessage</code>](#YoumeOnReceiveMessage) | <p>消息</p> |

<a name="YMRTC+event_signaling.status_[status]"></a>

### "event:signaling.status:[status]"
<p>信令连接状态改变。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 信令服务器连接  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| status | <code>string</code> | <p>新的状态值，状态的取值：<br></p> <ul> <li><code>disconnected</code>: 未连接；<br></li> <li><code>connecting</code>: 正在尝试连接；<br></li> <li><code>connected</code>: 已连接；<br></li> <li><code>reconnecting</code>: （掉线后）重新连接；<br></li> <li><code>ended</code>: 用户主动结束了连接。<br></li> </ul> |

<a name="YMRTC+event_signaling.ready"></a>

### "event:signaling.ready"
<p>信令服务器已经成功连接，等同于事件 <code>signaling.status:connected</code></p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 信令服务器连接  
<a name="YMRTC+requestUserStream"></a>

### ymrtC.requestUserStream(userId) ⇒ <code>Promise</code>
<p>异步请求一个成员的媒体流（stream）。若未与此成员建立连接，
则等待连接完成，否则直接回调已存在的媒体流。
<strong>注意</strong>：中途媒体流对象可能会发生改变，请监听
“<code>user.update-stream</code>”事件以对界面做出相应的改变。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 成员控制  
**完成回调**: <code>MediaStream</code> - 得到的媒体流对象，
赋值给 `<video>` 或 `<audio>` 的 `srcObject` 属性即可播放。
关于此对象的更多资料，可参阅 [mdn 文档](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)  
**拒绝回调**: <code>void</code> - 由于会一直等待媒体流，因此暂时未设定请求失败的情况  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| userId | <code>string</code> | <p>成员ID</p> |

<a name="YMRTC+getMute"></a>

### ymrtC.getMute(userId) ⇒ <code>boolean</code>
<p>获取一个成员的静音状态。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: <code>boolean</code> - <p>是否静音</p>  
**分类**: 成员控制  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| userId | <code>string</code> | <p>成员ID</p> |

<a name="YMRTC+setMute"></a>

### ymrtC.setMute(userId, isMuted)
<p>为一个成员的音频流设置静音。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 成员控制  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| userId | <code>string</code> | <p>成员ID</p> |
| isMuted | <code>boolean</code> | <p>是否静音</p> |

<a name="YMRTC+setAllMute"></a>

### ymrtC.setAllMute(isMuted)
<p>为所有成员的音频流设置静音。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 成员控制  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| isMuted | <code>boolean</code> | <p>是否静音</p> |

<a name="YMRTC+event_user.ice-status_[memberId]_[status]"></a>

### "event:user.ice-status:[memberId]:[status]"
<p>原生 ICE (RTC.iceConnectionState) 状态有改变，
可参阅 <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState">mdn 文档</a></p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 成员控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| memberId | <code>string</code> | <p>状态有改变的成员ID</p> |
| status | <code>string</code> | <p>新状态，状态的取值请参阅 <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState">mdn 文档</a></p> |

<a name="YMRTC+event_user.signaling-status_[memberId]_[status]"></a>

### "event:user.signaling-status:[memberId]:[status]"
<p>与成员之间的连接协商状态有改变。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 成员控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| memberId | <code>string</code> | <p>状态有改变的成员ID</p> |
| status | <code>string</code> | <p>新状态，状态的取值: <br></p> <ul> <li><code>new</code>: 未连接；<br></li> <li><code>waiting</code>: 等待对方连接过来；<br></li> <li><code>negotiating</code>: 正在协商（交换视频格式信息等等）；<br></li> <li><code>negotiated</code>: 协商完成（成功）；<br></li> <li><code>failed</code>: 连接失败。<br></li> </ul> |

<a name="YMRTC+event_user.update-stream_[memberId]"></a>

### "event:user.update-stream:[memberId]"
<p>成员的媒体流有改变，这时需要更新对应成员的 <code>&lt;video&gt;</code> 或 <code>&lt;audio&gt;</code> 的 srcObject 属性。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 成员控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| memberId | <code>string</code> | <p>有改变的成员ID</p> |
| stream | <code>MediaStream</code> | <p>新的媒体流，把此值赋值给 <code>&lt;video&gt;</code> 或 <code>&lt;audio&gt;</code> 的 srcObject 属性即可更新媒体流。</p> |

<a name="YMRTC+event_user.remove-stream_[memberId]"></a>

### "event:user.remove-stream:[memberId]"
<p>成员的媒体流被对方移除，这时对应成员的 <code>&lt;video&gt;</code> 或 <code>&lt;audio&gt;</code> 的视频或音频播放可能会突然定格或停止，忽略它而不做处理并无大碍，此事件用于防备不时之需。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 成员控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| memberId | <code>string</code> | <p>有改变的成员ID</p> |

<a name="YMRTC+event_user.media-stats-update_[memberId]"></a>

### "event:user.media-stats-update:[memberId]"
<p>刷新了从成员接收（下载）的媒体的状态参数。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 成员控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| memberId | <code>string</code> | <p>成员ID</p> |
| stats | [<code>MediaStats</code>](#MediaStats) | <p>媒体状态参数</p> |

<a name="YMRTC+event_user.pause-subscribe_[memberId]"></a>

### "event:user.pause-subscribe:[memberId]"
<p>暂停订阅流服务某用户的媒体流</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 成员控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| memberId | <code>string</code> | <p>成员ID</p> |
| isAudioPaused | <code>boolean</code> | <p>音频流是否暂停订阅</p> |
| isVideoPaused | <code>boolean</code> | <p>视频流是否暂停订阅</p> |

<a name="YMRTC+event_user.resume-subscribe_[memberId]"></a>

### "event:user.resume-subscribe:[memberId]"
<p>恢复阅流服务某用户的媒体流</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 成员控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| memberId | <code>string</code> | <p>成员ID</p> |
| isAudioResumed | <code>boolean</code> | <p>音频流是否恢复订阅</p> |
| isVideoResumed | <code>boolean</code> | <p>视频流流是否恢复订阅</p> |

<a name="YMRTC+joinRoom"></a>

### ymrtC.joinRoom(roomId, codec) ⇒ <code>Promise</code>
<p>加入房间，会自动等待登录成功再加入房间。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 房间控制  
**完成回调**: <code>void</code> - 加入房间成功  
**拒绝回调**: <code>void</code> - 由于自动等待登录和本地媒体，因此暂时没有定义失败的情况  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> \| <code>number</code> | <p>房间ID</p> |
| codec | <code>string</code> | <p>用于设置浏览器使用的编解码格式。如果你需要使用 Safari 12.1 及之前版本，将该参数设为 &quot;h264&quot;；其他情况我们推荐使用 &quot;vp8&quot;</p> |

<a name="YMRTC+leaveRoom"></a>

### ymrtC.leaveRoom([roomId])
<p>退出房间，并断开房间内成员之间的连接。强制退出，无返回值。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 房间控制  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| [roomId] | <code>string</code> \| <code>number</code> | <p>可选。指定要退出的房间ID，若不指定则退出所有房间</p> |

<a name="YMRTC+inRoom"></a>

### ymrtC.inRoom(roomId) ⇒ <code>boolean</code>
<p>返回目前是否正在某个房间之内。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: <code>boolean</code> - <ul>
<li>是否在房间内</li>
</ul>  
**分类**: 房间控制  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> \| <code>number</code> | <p>房间ID</p> |

<a name="YMRTC+getRoomIdList"></a>

### ymrtC.getRoomIdList() ⇒ <code>Array.&lt;string&gt;</code>
<p>返回当前已经加入的房间ID列表。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: <code>Array.&lt;string&gt;</code> - <ul>
<li>房间ID数组</li>
</ul>  
**分类**: 房间控制  
<a name="YMRTC+getRoomMemberIdList"></a>

### ymrtC.getRoomMemberIdList(roomId) ⇒ <code>Array.&lt;string&gt;</code>
<p>返回房间内所有成员的ID列表。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: <code>Array.&lt;string&gt;</code> - <ul>
<li>成员ID数组</li>
</ul>  
**分类**: 房间控制  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> \| <code>number</code> | <p>房间ID</p> |

<a name="YMRTC+getRoomMediaStats"></a>

### ymrtC.getRoomMediaStats(roomId) ⇒ [<code>MediaStats</code>](#MediaStats) \| <code>null</code>
<p>返回房间上一秒的媒体上传状态</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: [<code>MediaStats</code>](#MediaStats) \| <code>null</code> - <ul>
<li>媒体参数（上传），若房间不存在或媒体未启动或其他原因无法获取，则返回 null</li>
</ul>  
**分类**: 房间控制  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> \| <code>number</code> | <p>房间ID</p> |

<a name="YMRTC+getUserMediaStats"></a>

### ymrtC.getUserMediaStats(userId) ⇒ [<code>MediaStats</code>](#MediaStats) \| <code>null</code>
<p>返回某成员上一秒的媒体接收状态</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: [<code>MediaStats</code>](#MediaStats) \| <code>null</code> - <ul>
<li>媒体参数（接收），若成员不存在或媒体未传过来或其他原因无法获取，则返回 null</li>
</ul>  
**分类**: 房间控制  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| userId | <code>string</code> \| <code>number</code> | <p>成员ID</p> |

<a name="YMRTC+event_room.update_[roomId]"></a>

### "event:room.update:[roomId]"
<p>房间[roomId]中的推流成员有更新（有人加入或者离开）。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| members | <code>Array.&lt;string&gt;</code> | <p>房间内所有成员的ID列表</p> |

<a name="YMRTC+event_room.member-join_[roomId]"></a>

### "event:room.member-join:[roomId]"
<p>一位成员加入了房间[roomId]，处于推流状态，媒体流即将到来。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| member | <code>string</code> | <p>加入房间的成员ID</p> |

<a name="YMRTC+event_room.member-leave_[roomId]"></a>

### "event:room.member-leave:[roomId]"
<p>一位成员离开了房间[roomId]，处于停止推流状态，媒体流即将结束。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| member | <code>string</code> | <p>离开房间的成员ID</p> |

<a name="YMRTC+event_room.join_[roomId]"></a>

### "event:room.join:[roomId]"
<p>本帐户进入了房间[roomId]。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |

<a name="YMRTC+event_room.leave_[roomId]"></a>

### "event:room.leave:[roomId]"
<p>本帐户离开了房间[roomId]。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |

<a name="YMRTC+event_room.media-stats-update_[roomId]"></a>

### "event:room.media-stats-update:[roomId]"
<p>刷新了发送（上传）给房间[roomId]的媒体的状态参数。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| stats | [<code>MediaStats</code>](#MediaStats) | <p>媒体状态参数</p> |

<a name="YMRTC+event_room.other-mic-off_[roomId]"></a>

### "event:room.other-mic-off:[roomId]"
<p>远端用户麦克风关闭。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| userId | <code>string</code> | <p>用户ID</p> |

<a name="YMRTC+event_room.other-mic-on_[roomId]"></a>

### "event:room.other-mic-on:[roomId]"
<p>远端用户麦克风开启。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| userId | <code>string</code> | <p>用户ID</p> |

<a name="YMRTC+event_room.other-video-input-start_[roomId]"></a>

### "event:room.other-video-input-start:[roomId]"
<p>远端用户摄像头开启。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| userId | <code>string</code> | <p>用户ID</p> |

<a name="YMRTC+event_room.other-video-input-stop_[roomId]"></a>

### "event:room.other-video-input-stop:[roomId]"
<p>远端用户摄像头关闭。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| userId | <code>string</code> | <p>用户ID</p> |

<a name="YMRTC+event_room.others-speaker-off_[roomId]"></a>

### "event:room.others-speaker-off:[roomId]"
<p>远端用户扬声器关闭。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| userId | <code>string</code> | <p>用户ID</p> |

<a name="YMRTC+event_room.others-speaker-on_[roomId]"></a>

### "event:room.others-speaker-on:[roomId]"
<p>远端用户扬声器开启。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| userId | <code>string</code> | <p>用户ID</p> |

<a name="YMRTC+event_room.member-change_[roomId]"></a>

### "event:room.member-change:[roomId]"
<p>房间成员变化事件。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 房间控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| roomId | <code>string</code> | <p>房间ID</p> |
| users | [<code>Array.&lt;YoumeMemberChangeUser&gt;</code>](#YoumeMemberChangeUser) | <p>用户加入退出信息</p> |

<a name="YMRTC+startLocalMedia"></a>

### ymrtC.startLocalMedia([mediaConfig]) ⇒ <code>Promise</code>
<p>启动本地媒体。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 本地媒体控制  
**完成回调**: <code>MediaStream</code> - 启动成功，获得本地媒体流对象，
赋值给 `<video>` 或 `<audio>` 的 `srcObject` 属性即可播放。
关于此对象的更多资料，可参阅 [mdn 文档](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)  
**拒绝回调**: <code>DOMException</code> - 启动失败，获得原生的错误对象。
                         具体错误可参见 [mdn 文档](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Return_value)。  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| [mediaConfig] | [<code>MediaConfig</code>](#MediaConfig) | <p>媒体配置</p> |

<a name="YMRTC+pauseLocalMedia"></a>

### ymrtC.pauseLocalMedia()
<p>暂停本地媒体（屏蔽摄像头、关闭麦克风）。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 本地媒体控制  
<a name="YMRTC+pauseLocalVideo"></a>

### ymrtC.pauseLocalVideo()
<p>暂停本地视频（只屏蔽摄像头，麦克风不变）。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 本地媒体控制  
<a name="YMRTC+pauseLocalAudio"></a>

### ymrtC.pauseLocalAudio()
<p>暂停本地视频（只屏蔽麦克风，摄像头不变）。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 本地媒体控制  
<a name="YMRTC+resumeLocalMedia"></a>

### ymrtC.resumeLocalMedia()
<p>恢复本地媒体（取消屏蔽摄像头、取消关闭麦克风）。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 本地媒体控制  
<a name="YMRTC+resumeLocalVideo"></a>

### ymrtC.resumeLocalVideo()
<p>恢复本地视频（只取消屏蔽摄像头、麦克风不变）。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 本地媒体控制  
<a name="YMRTC+resumeLocalAudio"></a>

### ymrtC.resumeLocalAudio()
<p>恢复本地音频（只取消屏蔽麦克风、摄像头不变）。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 本地媒体控制  
<a name="YMRTC+isLocalVideoPaused"></a>

### ymrtC.isLocalVideoPaused() ⇒ <code>boolean</code>
<p>返回摄像头是否为屏蔽状态。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: <code>boolean</code> - <ul>
<li>true: 屏蔽了，false: 没屏蔽</li>
</ul>  
**分类**: 本地媒体控制  
<a name="YMRTC+isLocalAudioPaused"></a>

### ymrtC.isLocalAudioPaused() ⇒ <code>boolean</code>
<p>返回麦克风是否为屏蔽状态。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: <code>boolean</code> - <ul>
<li>true: 屏蔽了，false: 没屏蔽</li>
</ul>  
**分类**: 本地媒体控制  
<a name="YMRTC+stopLocalMedia"></a>

### ymrtC.stopLocalMedia()
<p>停止本地媒体（关掉摄像头和麦克风的电源）。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 本地媒体控制  
<a name="YMRTC+getLocalMediaStatus"></a>

### ymrtC.getLocalMediaStatus() ⇒ <code>string</code>
<p>获取本地媒体的当前状态。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: <code>string</code> - <ul>
<li><code>stop</code>: 未启动，<br><code>starting</code>: 正在尝试启动，
<code>recording</code>: 已经启动，正在录音和/或录像，<code>failed</code>: 启动失败</li>
</ul>  
**分类**: 本地媒体控制  
<a name="YMRTC+requestLocalMediaStream"></a>

### ymrtC.requestLocalMediaStream() ⇒ <code>Promise</code>
<p>异步请求本地媒体流 (stream)。若本地媒体尚未启动，
则等待启动成功，否则直接回调已存在的媒体流。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 本地媒体控制  
**完成回调**: <code>MediaStream</code> - 获得本地媒体流
赋值给 `<video>` 或 `<audio>` 的 `srcObject` 属性即可播放。
关于此对象的更多资料，可参阅 [mdn 文档](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)  
**拒绝回调**: <code>DOMException</code> - 启动失败，获得原生的错误对象。  
<a name="YMRTC+event_local-media.status_[status]"></a>

### "event:local-media.status:[status]"
<p>本地媒体状态改变。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 本地媒体控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| status | <code>string</code> | <p>新的状态值，状态的取值：<br></p> <ul> <li><code>stop</code>: 本地媒体已经停止（摄像头和麦克风都已经关掉了）；<br></li> <li><code>starting</code>: 正在尝试启动本地媒体（包括请求权限和初始化设备）；<br></li> <li><code>recording</code>: 本地媒体已经成功启动，正在录像和/或录音；<br></li> <li><code>failed</code>: 失败（可能设备出错，或者用户禁止了摄像头和麦克风权限）。<br></li> </ul> |

<a name="YMRTC+event_local-media.has-stream"></a>

### "event:local-media.has-stream"
<p>本地媒体流已经准备就绪。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 本地媒体控制  
**属性**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| stream | <code>MediaStream</code> | <p>本地媒体流对象。</p> |

<a name="YMRTC+event_local-media.remove-stream"></a>

### "event:local-media.remove-stream"
<p>本地媒体流被移除。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 本地媒体控制  
<a name="YMRTC+event_local-media.pause-video"></a>

### "event:local-media.pause-video"
<p>本地媒体视频暂停（屏蔽了摄像头，对方只能看到黑屏）。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 本地媒体控制  
<a name="YMRTC+event_local-media.pause-audio"></a>

### "event:local-media.pause-audio"
<p>本地媒体音频暂停（关闭了麦克风，使对方听不到声音）。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 本地媒体控制  
<a name="YMRTC+event_local-media.resume-video"></a>

### "event:local-media.resume-video"
<p>本地媒体视频恢复（取消暂停状态，摄像头重新亮起来）。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 本地媒体控制  
<a name="YMRTC+event_local-media.resume-audio"></a>

### "event:local-media.resume-audio"
<p>本地媒体音频暂停（取消暂停状态，麦克风重新开始采集声音）。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 本地媒体控制  
<a name="YMRTC+login"></a>

### ymrtC.login(userId, token) ⇒ <code>Promise</code>
<p>用户登录。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 用户帐户控制  
**完成回调**: <code>void</code> - 登录成功  
**拒绝回调**: <code>string</code> - 登录失败，回调失败信息  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| userId | <code>string</code> | <p>用户ID</p> |
| token | <code>string</code> | <p>用户密码</p> |

<a name="YMRTC+logout"></a>

### ymrtC.logout()
<p>用户退出登录，断开所有连接。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**分类**: 用户帐户控制  
<a name="YMRTC+getMyUserId"></a>

### ymrtC.getMyUserId() ⇒ <code>string</code>
<p>获得当前用户ID。</p>

**类型**: 实例方法(function)，来自 [<code>YMRTC</code>](#YMRTC)  
**返回值**: <code>string</code> - <ul>
<li>用户ID。若未登录，则返回空字符串 ''。</li>
</ul>  
**分类**: 用户帐户控制  
<a name="YMRTC+event_account.logged"></a>

### "event:account.logged"
<p>用户登录成功。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 用户帐户控制  
<a name="YMRTC+event_account.logging"></a>

### "event:account.logging"
<p>正在登录。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 用户帐户控制  
<a name="YMRTC+event_account.logout"></a>

### "event:account.logout"
<p>已登出。</p>

**类型**: 事件，由 [<code>YMRTC</code>](#YMRTC) 触发  
**分类**: 用户帐户控制  
<a name="InitConfig"></a>

## InitConfig : <code>Object</code>
<p>初始化 YIM 对象的配置</p>

**类型**: 全局自定义类型(typedef)  

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| appKey | <code>string</code> |  | <p>游密分配的 appKey</p> |
| [userId] | <code>string</code> |  | <p>可选。用户登录 ID，若在此处直接输入用户ID和密码，则初始化后自动登录</p> |
| [token] | <code>string</code> |  | <p>可选。用户登录密码，若在此处直接输入用户ID和密码，则初始化后自动登录</p> |
| [roomId] | <code>string</code> |  | <p>可选。要加入的房间ID，若输入此值，则初始化并登录（自动或手动登录均可）之后自动加入房间</p> |
| [video] | <code>boolean</code> | <code>true</code> | <p>是否为视频聊天，若为 <code>false</code> 则为仅语音聊天</p> |
| [debug] | <code>boolean</code> \| <code>string</code> \| <code>Array.&lt;string&gt;</code> |  | <p>可选。是否输出调试信息</p> |
| [codec] | <code>string</code> | <code>&quot;&#x27;h264&#x27;&quot;</code> | <p>用于设置浏览器使用的编解码格式。如果你需要使用 Safari 12.1 及之前版本，将该参数设为 &quot;h264&quot;；其他情况我们推荐使用 &quot;vp8&quot; @</p> |

<a name="MediaConfig"></a>

## MediaConfig : <code>Object</code>
<p>初始化 YIM 对象的配置</p>

**类型**: 全局自定义类型(typedef)  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| [video] | <code>string</code> \| <code>boolean</code> | <p>视频配置，可选值：false |                                                  'screen' |                                                  'window' |                                                  'lowres' |          // 320x240                                                  'lowres-16:9' |     // 320x180                                                  'stdres' |          // 640x480，默认值                                                  'stdres-16:9' |     // 640x360                                                  'hires'  | 'hires-16:9' | 'hdres' |  // 都是 1280x720，不能支持4:3                                                  'fhdres' |          // 1920x1080                                                  '4kres';            // 3840x2160</p> |
| [audio] | <code>string</code> \| <code>boolean</code> | <p>音频配置，可选值：false | 'screen' | 'mic' | true</p> |
| [screenSourceId] | <code>string</code> | <p>若为 Electron 屏幕录像，可以传入特定的 sourceId</p> |
| [stream] | <code>MediaStream</code> | <p>若自行建立 MediaStream 则可以直接用于此</p> |

<a name="MediaStats"></a>

## MediaStats : <code>Object</code>
<p>初始化 YIM 对象的配置</p>

**类型**: 全局自定义类型(typedef)  

| 参数 | 类型 |
| --- | --- |
| speed | <code>number</code> | 
| packetsLostRate | <code>number</code> | 
| bytesTransferred | <code>number</code> | 

<a name="YoumeMemberChangeUser"></a>

## YoumeMemberChangeUser : <code>Object</code>
<p>member-change事件中的用户信息</p>

**类型**: 全局自定义类型(typedef)  

| 参数 | 类型 |
| --- | --- |
| userId | <code>string</code> | 
| roomId | <code>string</code> | 
| isJoin | <code>boolean</code> | 

<a name="YoumeOnReceiveMessage"></a>

## YoumeOnReceiveMessage : <code>Object</code>
<p>服务端广播的自定义消息</p>

**类型**: 全局自定义类型(typedef)  

| 参数 | 类型 |
| --- | --- |
| fromUserId | <code>string</code> | 
| msg | <code>string</code> | 
| roomId | <code>string</code> | 

