

# webpack-ftp-plugin


<p align="center"><img width="600px" src="http://owzieh3tb.bkt.clouddn.com/ftp-plugin.png" alt="实例"></p>

### Usage


Basic Usage
-----------

1. 在项目根目录 需要添加个ftp验证文件 文件名：.ftppass
  格式如下 ：
```javascript
    {
        "authKey": {
            "username": "virtual",
            "password": "yifanfengshun123"
        },
        "host": "10.4.233.175",
        "port": "21"
    }
```

2. add the plugin to your webpack config as follows:

```javascript
var WebpackFtpPlugin = require('webpack-sft-plugin')
var webpackConfig = {
  entry: 'index.js',
  output: {
    path: 'dist',
    filename: 'index_bundle.js'
  },
  plugins: [new WebpackFtpPlugin(new GearFtpPlugin({
    remoteRoot: '/',
    localRoot: __dirname,
    deployPath: './build'
}))]
}
```

### 注意事项
 
 env支持，production生产环境才能deploy
-----------
process.env.NODE_ENV === 'production':


```javascript
new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
})
```

### License

[MIT](http://opensource.org/licenses/MIT)