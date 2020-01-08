2019-01-29 version 1.0.3
1. 优化：在requestUserStream后才接收数据
2. 默认fps 调整

2018-12-18 version 1.0.2

1. 添加获取设备列表的接口, 在login调用后, 即可调用如果接口获取
``` js
ymrtc.getAllDevices().then(list=>{
    console.log(JSON.stringify(list))
    /* list 格式
    {"audioInput":[{"id":"default","label":"默认 - 内置麦克风 (Built-in)"},{"id":"5a871f1ef47dab2c84b1ab0fd648e0cb965020db01998a7e3c69b3b386ec3c58","label":"内置麦克风 (Built-in)"}],"audioOutput":[{"id":"default","label":"默认 - 内置扬声器 (Built-in)"},{"id":"8a419d752dd8a9912a3f417a352f57b731a4c97e3d3c52b64c780b0aae3bdd81","label":"内置扬声器 (Built-in)"}],"videoInput":[{"id":"65dc40811966be0048ede0e94927658f211f61857392df414b2adb843dd7bef8","label":"FaceTime 高清摄像头（内建） (05ac:8511)"}]}
    */
})
```

2. 设置声音输出设备
``` js
    /**
     * 设置声音输出设备, 建议在绑定远端stream到 html的video 标签时调用
     * @param mediaObject video或者audio的html对象
     * @param deviceID 选择的设备id, 用getAllDevices 返回的 audioOutput 列表里的 id字段值
     */
    public setOutputDevice(mediaObject:HTMLMediaElement,deviceID:string):boolean
    // 示例:
    ymrtc.setOutputDevice($('#local-media')[0],'d0d8e8ee7fa555165b84c1497e123badb3bfe32e53566efe4800ea07533df809');
```