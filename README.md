

# webpack-ftp-plugin


<p align="center"><img width="600px" src="http://owzieh3tb.bkt.clouddn.com/ftp-plugin.png" alt="实例"></p>

### Usage


Basic Usage
-----------
1. 安装

```
     $  npm i webpack-ftp-plugin
```
或是
```
    $  yarn  add --dev  webpack-ftp-plugin
```

2. 在项目根目录 需要添加个ftp验证文件 文件名：.ftppass
  格式如下 ：
```javascript
    {
        "authKey": {
            "username": "xx",
            "password": "xxx"
        },
        "host": "x.x.x.x",
        "port": "21"
    }
```

3. add the plugin to your webpack config as follows:

```javascript
var WebpackFtpPlugin = require('webpack-ftp-plugin')
var webpackConfig = {
  entry: 'index.js',
  output: {
    path: 'dist',
    filename: 'index_bundle.js'
  },
  plugins: [new WebpackFtpPlugin({
    remoteRoot: '/',
    localRoot: __dirname,
    deployPath: './build'
})]
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