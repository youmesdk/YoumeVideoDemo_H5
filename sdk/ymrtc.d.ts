/**
 * @fileOverview 主入口，封装各种方法和事件
 * @author benz@youme.im
 * @date 2018/8/15
 *
 * 每位工程师都有保持代码优雅的义务
 * each engineer has a duty to keep the code elegant
 */

type eventCallback = (...payload: any[]) => void;
type wildcardEventCallback = (eventName: string, ...payload: any[]) => void;

export class WildEmitter  {
    static mixin<T>(object: T): T & WildEmitter;

    isWildEmitter: true;

    emit(event: string, ...payload: any[]): any;

    off(event: string, fn?: Function): any;

    on(event: string, groupName: string, fn: eventCallback | wildcardEventCallback): any;
    on(event: string, fn: eventCallback | wildcardEventCallback): any;

    once(event: string, groupName: string, fn: eventCallback | wildcardEventCallback): any;
    once(event: string, fn: eventCallback | wildcardEventCallback): any;

    releaseGroup(groupName: string): any;
}

export type AnyJson =  boolean | number | string | null | JsonArray | JsonMap;
export interface JsonMap {  [key: string]: AnyJson; }
export interface JsonArray extends Array<AnyJson> {}

export type VideoConfig =
    'lowres' |          /* 320x240 */
    'lowres-16:9' |     /* 320x180 */
    'stdres' |          /* 640x480，默认值 */
    'stdres-16:9' |     /* 640x360 */
    'hires' | 'hires-16:9' | 'hdres' |  /* 都是 1280x720，不能支持4:3 */
    'fhdres' |          /* 1920x1080 */
    '4kres';            /* 3840x2160 */

export interface MediaConfig {
    video?: VideoConfig;
}

export interface MediaStats {
    speed: number;
    packetsLost: number,
    packetsTransferred: number,
    packetsLostRate: number;
    bytesTransferred: number;
}

export interface InitConfig {
    appKey: string;
    userId?: string;
    token?: string;
    roomId?: string | number;
    video?: boolean;
    debug?: boolean | 'all' | Array<'trace' | 'debug' | 'log' | 'warn' | 'error'>;
}

/**
 * RTC 类
 * @typicalname ymrtc
 */
declare class YMRTC extends WildEmitter {
    /**
     * @typedef InitConfig
     * @desc 初始化 YIM 对象的配置
     * @param {string} appKey - 游密分配的 appKey
     * @param {string} [userId] - 可选。用户登录 ID，若在此处直接输入用户ID和密码，则初始化后自动登录
     * @param {string} [token] - 可选。用户登录密码，若在此处直接输入用户ID和密码，则初始化后自动登录
     * @param {string} [roomId] - 可选。要加入的房间ID，若输入此值，则初始化并登录（自动或手动登录均可）之后自动加入房间
     * @param {boolean} [video=true] - 是否为视频聊天，若为 `false` 则为仅语音聊天
     * @param {boolean | string | string[]} [debug] - 可选。是否输出调试信息
     */

    /**
     * 是否支持 WebRTC
     */
    static support: boolean;
    /**
     * 新建一个游密 RTC 对象。
     * @param {InitConfig} config - 配置
     */
    constructor(config: InitConfig);
    init(config: InitConfig): void;
    /***** account *****/
    /**
     * 用户登录。
     * @param {string} userId - 用户ID
     * @param {string} token - 用户密码
     * @return {Promise}
     * @fulfil {void} - 登录成功
     * @reject {string} - 登录失败，回调失败信息
     * @category 用户帐户控制
     */
    login(userId: string, token: string): Promise<void>;
    /**
     * 用户退出登录，断开所有连接。
     * @category 用户帐户控制
     */
    logout(): void;
    /**
     * 获得当前用户ID。
     * @return {string} - 用户ID。若未登录，则返回空字符串 ''。
     * @category 用户帐户控制
     */
    getMyUserId(): string;
    /***** room *****/
    /**
     * 加入房间，会自动等待登录成功以及本地媒体初始化完成再加入房间。
     * @param {string | number} roomId - 房间ID
     * @return {Promise}
     * @fulfil {void} - 加入房间成功
     * @reject {void} - 由于自动等待登录和本地媒体，因此暂时没有定义失败的情况
     * @category 房间控制
     */
    joinRoom(roomId: string | number): Promise<void>;
    /**
     * 退出房间，并断开房间内成员之间的连接。强制退出，无返回值。
     * @param {string | number} [roomId] - 可选。指定要退出的房间ID，若不指定则退出所有房间
     * @category 房间控制
     */
    leaveRoom(roomId: string | number): void;
    /**
     * 返回目前是否正在某个房间之内。
     * @param {string | number} roomId - 房间ID
     * @return {boolean} - 是否在房间内
     * @category 房间控制
     */
    inRoom(roomId: string | number): boolean;
    /**
     * 返回当前已经加入的房间ID列表。
     * @return {string[]} - 房间ID数组
     * @category 房间控制
     */
    getRoomIdList(): string[];
    /**
     * 返回房间内所有成员的ID列表。
     * @param {string | number} roomId - 房间ID
     * @return {string[]} - 成员ID数组
     * @category 房间控制
     */
    getRoomMemberIdList(roomId: string | number): string[];
    /**
     * 返回房间上一秒的媒体上传状态
     * @param {string | number} roomId - 房间ID
     * @return {MediaStats | null} - 媒体参数（上传），若房间不存在或媒体未启动或其他原因无法获取，则返回 null
     * @category 房间控制
     */
    getRoomMediaStats(roomId: string | number): MediaStats | null;
    /***** user *****/
    /**
     * 异步请求一个成员的媒体流（stream）。若未与此成员建立连接，
     * 则等待连接完成，否则直接回调已存在的媒体流。
     * **注意**：中途媒体流对象可能会发生改变，请监听
     * “`user.update-stream`”事件以对界面做出相应的改变。
     * @param {string} userId - 成员ID
     * @return {Promise}
     * @fulfil {MediaStream} - 得到的媒体流对象，
     * 赋值给 `<video>` 或 `<audio>` 的 `srcObject` 属性即可播放。
     * 关于此对象的更多资料，可参阅 [mdn 文档](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
     * @reject {void} - 由于会一直等待媒体流，因此暂时未设定请求失败的情况
     * @category 成员控制
     */
    requestUserStream(userId: string | number): Promise<MediaStream>;
    /**
     * 获取一个成员的静音状态。
     * @param {string} userId - 成员ID
     * @return {boolean} 是否静音
     * @category 成员控制
     */
    getMute(userId: string | number): boolean;
    /**
     * 为一个成员的音频流设置静音。
     * @param {string} userId - 成员ID
     * @param {boolean} isMuted - 是否静音
     * @category 成员控制
     */
    setMute(userId: string | number, isMuted: boolean): void;
    /**
     * 为所有成员的音频流设置静音。
     * @param {boolean} isMuted - 是否静音
     * @category 成员控制
     */
    setAllMute(isMuted: boolean): void;
    /**
     * 返回某成员上一秒的媒体接收状态
     * @param {string | number} userId - 成员ID
     * @return {MediaStats | null} - 媒体参数（接收），若成员不存在或媒体未传过来或其他原因无法获取，则返回 null
     * @category 房间控制
     */
    getUserMediaStats(userId: string | number): MediaStats | null;
    /***** local media *****/
    startRTC(mediaConfig?: MediaConfig): Promise<MediaStream>;
    /**
     * 启动本地媒体。
     * @param {MediaConfig=} mediaConfig 媒体配置
     * @return {Promise}
     * @fulfil {MediaStream} - 启动成功，获得本地媒体流对象，
     * 赋值给 `<video>` 或 `<audio>` 的 `srcObject` 属性即可播放。
     * 关于此对象的更多资料，可参阅 [mdn 文档](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
     * @reject {DOMException} - 启动失败，获得原生的错误对象。
     *                          具体错误可参见 [mdn 文档](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Return_value)。
     * @category 本地媒体控制
     */
    startLocalMedia(mediaConfig?: MediaConfig): Promise<MediaStream>;
    /**
     * 暂停本地媒体（屏蔽摄像头、关闭麦克风）。
     * @category 本地媒体控制
     */
    pauseLocalMedia(): void;
    /**
     * 暂停本地视频（只屏蔽摄像头，麦克风不变）。
     * @category 本地媒体控制
     */
    pauseLocalVideo(): void;
    /**
     * 暂停本地视频（只屏蔽麦克风，摄像头不变）。
     * @category 本地媒体控制
     */
    pauseLocalAudio(): void;
    pause(): void;
    /**
     * 恢复本地媒体（取消屏蔽摄像头、取消关闭麦克风）。
     * @category 本地媒体控制
     */
    resumeLocalMedia(): void;
    /**
     * 恢复本地视频（只取消屏蔽摄像头、麦克风不变）。
     * @category 本地媒体控制
     */
    resumeLocalVideo(): void;
    /**
     * 恢复本地音频（只取消屏蔽麦克风、摄像头不变）。
     * @category 本地媒体控制
     */
    resumeLocalAudio(): void;
    resume(): void;
    /**
     * 返回摄像头是否为屏蔽状态。
     * @return {boolean} - true: 屏蔽了，false: 没屏蔽
     * @category 本地媒体控制
     */
    isLocalVideoPaused(): boolean;
    /**
     * 返回麦克风是否为屏蔽状态。
     * @return {boolean} - true: 屏蔽了，false: 没屏蔽
     * @category 本地媒体控制
     */
    isLocalAudioPaused(): boolean;
    /**
     * 停止本地媒体（关掉摄像头和麦克风的电源）。
     * @category 本地媒体控制
     */
    stopLocalMedia(): void;
    /**
     * 获取本地媒体的当前状态。
     * @return {string} - `stop`: 未启动，<br>`starting`: 正在尝试启动，
     * `recording`: 已经启动，正在录音和/或录像，`failed`: 启动失败
     * @category 本地媒体控制
     */
    getLocalMediaStatus(): string;
    /**
     * 异步请求本地媒体流 (stream)。若本地媒体尚未启动，
     * 则等待启动成功，否则直接回调已存在的媒体流。
     * @return {Promise}
     * @fulfil {MediaStream} - 获得本地媒体流
     * 赋值给 `<video>` 或 `<audio>` 的 `srcObject` 属性即可播放。
     * 关于此对象的更多资料，可参阅 [mdn 文档](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
     * @reject {DOMException} - 启动失败，获得原生的错误对象。
     * @category 本地媒体控制
     */
    requestLocalMediaStream(): Promise<MediaStream>;

    /***** events *****/
    /**
     * 用户登录成功。
     * @event YMRTC#event:"account.logged"
     * @category 用户帐户控制
     */
    /**
     * 正在登录。
     * @event YMRTC#event:"account.logging"
     * @category 用户帐户控制
     */
    /**
     * 已登出。
     * @event YMRTC#event:"account.logout"
     * @category 用户帐户控制
     */
    /**
     * 房间[roomId]中的成员有更新（有人加入或者离开）。
     * @event YMRTC#event:"room.update:[roomId]"
     * @property {string} roomId - 房间ID
     * @property {string[]} members - 房间内所有成员的ID列表
     * @category 房间控制
     */
    /**
     * 一位成员加入了房间[roomId]。
     * @event YMRTC#event:"room.member-join:[roomId]"
     * @property {string} roomId - 房间ID
     * @property {string} member - 加入房间的成员ID
     * @category 房间控制
     */
    /**
     * 一位成员离开了房间[roomId]。
     * @event YMRTC#event:"room.member-leave:[roomId]"
     * @property {string} roomId - 房间ID
     * @property {string} member - 离开房间的成员ID
     * @category 房间控制
     */
    /**
     * 本帐户进入了房间[roomId]。
     * @event YMRTC#event:"room.join:[roomId]"
     * @property {string} roomId - 房间ID
     * @category 房间控制
     */
    /**
     * 本帐户离开了房间[roomId]。
     * @event YMRTC#event:"room.leave:[roomId]"
     * @property {string} roomId - 房间ID
     * @category 房间控制
     */
    /**
     * 刷新了发送（上传）给房间[roomId]的媒体的状态参数。
     * @event YMRTC#event:"room.media-stats-update:[roomId]"
     * @property {string} roomId - 房间ID
     * @property {MediaStats} stats - 媒体状态参数
     * @category 房间控制
     */
    /**
     * 原生 ICE (RTC.iceConnectionState) 状态有改变，
     * 可参阅 [mdn 文档](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState)
     * @event YMRTC#event:"user.ice-status:[memberId]:[status]"
     * @property {string} memberId - 状态有改变的成员ID
     * @property {string} status - 新状态，状态的取值请参阅 [mdn 文档](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState)
     * @category 成员控制
     */
    /**
     * 与成员之间的连接协商状态有改变。
     * @event YMRTC#event:"user.signaling-status:[memberId]:[status]"
     * @property {string} memberId - 状态有改变的成员ID
     * @property {string} status - 新状态，状态的取值: <br>
     *  - `new`: 未连接；<br>
     *  - `waiting`: 等待对方连接过来；<br>
     *  - `negotiating`: 正在协商（交换视频格式信息等等）；<br>
     *  - `negotiated`: 协商完成（成功）；<br>
     *  - `failed`: 连接失败。<br>
     * @category 成员控制
     */
    /**
     * 成员的媒体流有改变，这时需要更新对应成员的 `<video>` 或 `<audio>` 的 srcObject 属性。
     * @event YMRTC#event:"user.update-stream:[memberId]"
     * @property {string} memberId - 有改变的成员ID
     * @property {MediaStream} stream - 新的媒体流，把此值赋值给 `<video>` 或 `<audio>` 的 srcObject 属性即可更新媒体流。
     * @category 成员控制
     */
    /**
     * 成员的媒体流被对方移除，这时对应成员的 `<video>` 或 `<audio>` 的视频或音频播放可能会突然定格或停止，忽略它而不做处理并无大碍，此事件用于防备不时之需。
     * @event YMRTC#event:"user.remove-stream:[memberId]"
     * @property {string} memberId - 有改变的成员ID
     * @category 成员控制
     */
    /**
     * 刷新了从成员接收（下载）的媒体的状态参数。
     * @event YMRTC#event:"user.media-stats-update:[memberId]"
     * @property {string} memberId - 成员ID
     * @property {MediaStats} stats - 媒体状态参数
     * @category 成员控制
     */
    /**
     * 本地媒体状态改变。
     * @event YMRTC#event:"local-media.status:[status]"
     * @property {string} status - 新的状态值，状态的取值：<br>
     *  - `stop`: 本地媒体已经停止（摄像头和麦克风都已经关掉了）；<br>
     *  - `starting`: 正在尝试启动本地媒体（包括请求权限和初始化设备）；<br>
     *  - `recording`: 本地媒体已经成功启动，正在录像和/或录音；<br>
     *  - `failed`: 失败（可能设备出错，或者用户禁止了摄像头和麦克风权限）。<br>
     * @category 本地媒体控制
     */
    /**
     * 本地媒体流已经准备就绪。
     * @event YMRTC#event:"local-media.has-stream"
     * @property {MediaStream} stream - 本地媒体流对象。
     * @category 本地媒体控制
     */
    /**
     * 本地媒体流被移除。
     * @event YMRTC#event:"local-media.remove-stream"
     * @category 本地媒体控制
     */
    /**
     * 本地媒体视频暂停（屏蔽了摄像头，对方只能看到黑屏）。
     * @event YMRTC#event:"local-media.pause-video"
     * @category 本地媒体控制
     */
    /**
     * 本地媒体音频暂停（关闭了麦克风，使对方听不到声音）。
     * @event YMRTC#event:"local-media.pause-audio"
     * @category 本地媒体控制
     */
    /**
     * 本地媒体视频恢复（取消暂停状态，摄像头重新亮起来）。
     * @event YMRTC#event:"local-media.resume-video"
     * @category 本地媒体控制
     */
    /**
     * 本地媒体音频暂停（取消暂停状态，麦克风重新开始采集声音）。
     * @event YMRTC#event:"local-media.resume-audio"
     * @category 本地媒体控制
     */
    /**
     * 信令连接状态改变。
     * @event YMRTC#event:"signaling.status:[status]"
     * @property {string} status - 新的状态值，状态的取值：<br>
     *  - `disconnected`: 未连接；<br>
     *  - `connecting`: 正在尝试连接；<br>
     *  - `connected`: 已连接；<br>
     *  - `reconnecting`: （掉线后）重新连接；<br>
     *  - `ended`: 用户主动结束了连接。<br>
     * @category 信令服务器连接
     */
    /**
     * 信令服务器已经成功连接，等同于事件 `signaling.status:connected`
     * @event YMRTC#event:"signaling.ready"
     * @category 信令服务器连接
     */
}
export default YMRTC;
