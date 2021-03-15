/**
 * @file 游密 WebRTC 演示代码
 * @author BenzLeung(https://github.com/BenzLeung)
 * @date 2018/1/21
 * Created by JetBrains PhpStorm.
 *
 * 每位工程师都有保持代码优雅的义务
 * each engineer has a duty to keep the code elegant
 */
var YM_APPKEY = 'YOUME5BE427937AF216E88E0F84C0EF148BD29B691556';
var APIKEY = 'f2d520691f378d9e37ccfc76f46fbdb0'; // 实际使用时，API KEY只需要放到服务器端，


(function () {
    function E(id) {
        return document.getElementById(id);
    }

    // 检测浏览器支持
    if (!YMRTC.support) {
        alert('您的浏览器不支持RTC，请升级。');
        console.log('您的浏览器不支持RTC，请升级。');
        E('login-form').style.display = 'none';
        return;
    }

    let userTemplate = E('user-template').innerHTML;

    // 快捷填写测试账号
    E('login-sanji').onclick = E('login-fantasy').onclick = E('login-9999').onclick = E('login-zoro3000').onclick = E(
        'login-youme_test201701'
    ).onclick = E('login-youme_test201702').onclick = function (e) {
        let userId = e.target.value;
        E('login-user-id').value = userId;
    };

    // 初始化
    let ymrtc = new YMRTC({
        appKey: YM_APPKEY,
        video: true, // true - 视频+音频，false - 仅语音
        debug: 'all', // 开启测试日志
        dev: false // 是否使用测试环境 - 测试环境可以不填写appKey，若填写则使用填写的值
    });

    // ==================== Token 计算演示 ======================
    function genToken(appkey, apikey, userid) {
        var sha1src = appkey + apikey + userid;
        var token = CryptoJS.SHA1(sha1src).toString(CryptoJS.enc.Hex);
        return token;
    }
    // ==================== End Token 计算演示 ==================

    // 登录并加入房间
    E('login').onclick = function () {
        let userId = E('login-user-id').value;
        let token = genToken(YM_APPKEY, APIKEY, userId);
        let roomId = E('login-room-id').value;

        if (!userId) {
            alert('请输入用户ID。');
            return;
        }
        //ymrtc.getAllDevices().then(list=>{})
        // 登录
        ymrtc.login(userId, token).catch(() => {
            alert('登录失败。');
        });
        // 加入房间，会自动等待登录成功再加入房间
        if (roomId) {
            ymrtc.joinRoom(roomId, 'h264').catch((e) => {
                console.log("加入房间："+roomId);
                console.error(e);
                alert('进入频道失败');
            });
        }
    };

    // 登出
    E('logout').onclick = function () {
        ymrtc.logout();
        ymrtc.stopLocalMedia();
        E('local-media').style.display = 'none';
    };

    // 屏蔽摄像头和麦克风（黑屏、静音）
    E('local-media-pause-video').onclick = function (e) {
        if (ymrtc.isLocalVideoPaused()) {
            ymrtc.resumeLocalVideo();
            e.target.innerHTML = '关闭摄像头';
        } else {
            ymrtc.pauseLocalVideo();
            e.target.innerHTML = '开启摄像头';
        }
    };

    E('local-media-pause-audio').onclick = function (e) {
        if (ymrtc.isLocalAudioPaused()) {
            ymrtc.resumeLocalAudio();
            e.target.innerHTML = '关闭麦克风';
        } else {
            ymrtc.pauseLocalAudio();
            e.target.innerHTML = '开启麦克风';
        }
    };

    // 启动/停止本地媒体
    E('local-media-start-stop').onclick = function (e) {
        var s = ymrtc.getLocalMediaStatus();
        if (s === 'stop' || s === 'failed') {
            ymrtc
                .startLocalMedia({
                    video: 'stdres'
                })
                .catch((err) => {
                    if (err.name === 'NotAllowedError') {
                        alert('浏览器禁用了摄像头和麦克风的访问权限，或者页面没有使用 https 协议，请检查设置。');
                    } else if (err.name === 'NotFoundError') {
                        alert('没有找到摄像头或麦克风，请检查它们的连接。');
                    } else {
                        alert(err.name);
                    }
                });
            e.target.innerHTML = '停止摄像头';
        } else {
            ymrtc.stopLocalMedia();
            e.target.innerHTML = '启动摄像头';
        }
    };

    // 暂停接收流
    E('pause-subscribe-stream').onclick = function (e) {
        let userId = E('user-id').innerText;
        ymrtc
            .pauseSubscribe(userId)
            .then(() => {
                console.log('===========>pause subscribe success');
            })
            .catch((e) => {
                console.log('===========>pause subscribe error', e);
            });
    };

    // 继续接收流
    E('resume-subscribe-stream').onclick = function (e) {
        let userId = E('user-id').innerText;
        console.log('userId', userId);
        ymrtc
            .resumeSubscribe(userId)
            .then(() => {
                console.log('=======>resume subscribe success');
            })
            .catch((e) => {
                console.log('=======>resume subscribe error', e);
            });
    };

    // 启动/停止录屏, 针对 Electron 引擎
    E('local-screen-start-stop').onclick = function (e) {
        var s = ymrtc.getLocalMediaStatus();
        if (s === 'stop' || s === 'failed') {
            ymrtc
                .startLocalMedia({
                    video: 'screen'
                })
                .catch((err) => {
                    if (err.name === 'NotAllowedError') {
                        alert('浏览器禁用了摄像头和麦克风的访问权限，或者页面没有使用 https 协议，请检查设置。');
                    } else if (err.name === 'NotFoundError') {
                        alert('没有找到摄像头或麦克风，请检查它们的连接。');
                    } else {
                        alert(err.name);
                    }
                });
            e.target.innerHTML = '停止录屏';
        } else {
            ymrtc.stopLocalMedia();
            e.target.innerHTML = '启动录屏';
        }
    };

    // 退出或重新加入房间
    E('join-leave-room').onclick = function () {
        let roomId = E('room-id-input').value;
        if (!roomId) {
            alert('请输入房间号。');
            return;
        }
        if (ymrtc.inRoom(roomId)) {
            ymrtc.leaveRoom(roomId);
        } else {
            ymrtc.joinRoom(roomId).catch((e) => {
                console.error(e);
                alert('进入频道失败');
            });
        }
    };

    // 全部静音
    E('mute-all').onclick = function () {
        for (let i of document.querySelectorAll('.user-mute-on')) {
            i.click();
        }
    };

    // 取消全部静音
    E('cancel-mute-all').onclick = function () {
        for (let i of document.querySelectorAll('.user-mute-off')) {
            i.click();
        }
    };

    // 事件监听：登录、登出
    ymrtc.on('account.logged', function () {
        // 已登录
        E('not-log').style.display = 'none';
        E('logged').style.display = 'inline';
        E('login-form').style.display = 'none';
        E('rooms-container').style.display = 'block';
        E('user-id').innerHTML = ymrtc.getMyUserId();
    });

    ymrtc.on('account.logout', function () {
        // 已登出（并断开了各种连接）
        E('not-log').style.display = 'inline';
        E('logged').style.display = 'none';
        E('login-form').style.display = 'block';
        E('rooms-container').style.display = 'none';
        E('room').innerHTML = '';
        E('login').removeAttribute('disabled');
        E('login').innerHTML = '登录';
    });

    ymrtc.on('account.logging', function () {
        // 正在登录中
        E('login').setAttribute('disabled', true);
        E('login').innerHTML = '正在登录...';
    });

    // 事件监听：信令状态
    ymrtc.on('signaling.status:*', function (eventFullName, status) {
        E('signaling-status').innerHTML = status;
    });

    // 事件监听：本地媒体状态
    ymrtc.on('local-media.status:*', function (eventFullName, status) {
        E('local-media-status').innerHTML = status;
    });

    ymrtc.on('local-media.has-stream', function (stream) {
        E('local-media').style.display = 'inline-block';
        E('local-media').srcObject = stream;
        E('local-media-start-stop').innerHTML = '停止';
    });

    ymrtc.on('local-media.remove-stream', function () {
        E('local-media').style.display = 'none';
        E('local-media-start-stop').innerHTML = '启动';
    });

    // 事件监听：加入、退出房间
    ymrtc.on('room.join:*', function (eventFullName, roomId) {
        // 自己加入了房间
        E('room-id').innerHTML = roomId;
        E('room-id').style.display = 'inline';
        E('room-id-input').value = roomId;
        E('room-id-input').style.display = 'none';
        E('join-leave-room').innerHTML = '退出房间';
    });

    ymrtc.on('room.leave:*', function (eventFullName, roomId) {
        // 自己退出了房间
        E('room').innerHTML = '';
        E('room-id').style.display = 'none';
        E('room-id-input').style.display = 'inline-block';
        E('join-leave-room').innerHTML = '加入房间';
    });

    // 事件监听：用户进入、退出房间
    ymrtc.on('room.member-join:*', function (eventFullName, roomId, memberId) {
        console.log('=======>room.member-join', roomId, memberId,eventFullName);
        // 有人加入了房间
        let memberDom = E('user-container-' + memberId);
        if (!memberDom) {
            memberDom = document.createElement('div');
            memberDom.id = 'user-container-' + memberId;
            memberDom.className = 'user-container';
            memberDom.innerHTML = userTemplate.replace(/{{userId}}/g, memberId);
            E('room').appendChild(memberDom);

            ymrtc.requestUserStream(memberId).then(function (stream) {
                ymrtc.attachMediaStream(E('user-video-' + memberId), stream);
            });

            ymrtc.on('user.update-stream:' + memberId, function (mId, stream) {
                ymrtc.attachMediaStream(E('user-video-' + memberId), stream);
            });

            // 双击视频全屏
            E('user-video-' + memberId).ondblclick = function (e) {
                if (e.target.requestFullscreen) e.target.requestFullscreen();
                else if (e.target.webkitRequestFullScreen) e.target.webkitRequestFullScreen();
                else if (e.target.mozRequestFullScreen) e.target.mozRequestFullScreen();
            };

            E('user-mute-on-' + memberId).onclick = () => {
                E('user-video-' + memberId).muted = true; //静音，相当于关闭声音播放
                ymrtc.setMute(memberId, true);
            };

            E('user-mute-off-' + memberId).onclick = () => {
                E('user-video-' + memberId).muted = false; //取消静音，相当于打开声音播放
                ymrtc.setMute(memberId, false);
            };

            E('user-mute-on-' + memberId).checked = true;
        }
    });

    ymrtc.on('room.member-leave:*', function (eventFullName, roomId, memberId) {
        // 有人退出了房间
        console.log("有人离开了房间"+memberId);
        let memberDom = E('user-container-' + memberId);
        if (memberDom) {
            E('room').removeChild(memberDom);
        }
    });

    // 事件监听：媒体发送状态
    ymrtc.on('room.media-stats-update:*', function (eventFullName, roomId, stats) {
        E('room-stats').innerHTML = JSON.stringify(stats, null, 2);
    });

    // 事件监听：用户状态
    ymrtc.on('user.ice-status:*', function (eventFullName, userId, status) {
        // ICE 状态
        let userDom = E('user-ice-status-' + userId);
        if (userDom) {
            userDom.innerHTML = status;
        }
    });

    ymrtc.on('user.signaling-status:*', function (eventFullName, userId, status) {
        // 信令握手状态
        let userDom = E('user-signaling-status-' + userId);
        if (userDom) {
            userDom.innerHTML = status;
        }
    });

    ymrtc.on('user.media-stats-update:*', function (eventFullName, userId, stats) {
        // 信令握手状态
        let userDom = E('user-media-stats-' + userId);
        if (userDom) {
            userDom.innerHTML = JSON.stringify(stats, null, 2);
        }
    });

    // 远端用户关闭麦克风
    ymrtc.on('room.others-mic-off:*', (eventName, roomId, userId) => {
        console.log('====>other-mic-off', roomId, userId);
    });

    // 远端用户开启麦克风
    ymrtc.on('room.others-mic-on:*', (eventName, roomId, userId) => {
        console.log('====>others-mic-on', roomId, userId);
    });

    // 远端用户关闭扬声器
    ymrtc.on('room.others-speaker-off:*', (eventName, roomId, userId) => {
        console.log('====>others-speaker-off', roomId, userId);
    });

    // 远端用户关闭扬声器
    ymrtc.on('room.others-speaker-on:*', (eventName, roomId, userId) => {
        console.log('====>others-speaker-on', roomId, userId);
    });

    // 远端用户开启摄像头
    ymrtc.on('room.others-video-input-start:*', (eventName, roomId, userId) => {
        console.log('====>others-video-input-start', roomId, userId);
    });

    // 远端用户关闭摄像头
    ymrtc.on('room.others-video-input-stop:*', (eventName, roomId, userId) => {
        console.log('====>others-video-input-stop', roomId, userId);
    });

    // 用户加入退出房间
    ymrtc.on('room.member-change:*', (eventName, roomId, users) => {
        console.log('====>room.member-change', roomId, users,eventName);
    });

    // 广播消息
    ymrtc.on('room.on-recive-message:*', (eventName, roomId, msg) => {
        console.log('===>on-receive-message', roomId, msg);
    });

    // 暂停订阅流某用户的流
    ymrtc.on('user.pause-subscribe:*', (eventName, userId) => {
        console.log('====>pause-subscribe', userId);
    });

    // 恢复订阅流某用户流
    ymrtc.on('user.resume-subscribe:*', (eventName, userId) => {
        console.log('====>resume-subscribe', userId);
    });
})();
