# goman

> goman的升级版本，JAVA调式神器, 新增了些有意思实用的功能 (#^.^#)。提升开发效率

api请求测试，接口模拟请求调试工具, 绿色版客户端，无需额外环境 5秒启动

原项目在 [这里](https://github.com/zaaksam/goman) （感谢作者）

# 新版功能亮点
web版，支持一键配置请求头、formdata格式数据。具体操作如下：

### 一键配置请求头/formdata参数

1. 复制请求头参数
   ![](https://s3.ax1x.com/2020/12/30/rL5nDx.png)
2. 打开goman切换到Headers选项卡
   ![](https://s3.ax1x.com/2020/12/30/rL5MVK.png)
3. 使用 CTRL+SHIFT+S 一键配置copy的数据至headers（第一次使用需要允许相应的权限）
   ![](https://s3.ax1x.com/2020/12/30/rL5mK1.png)
4. 配置成功后~可以点击 撤回 按钮撤销本地更改的数据
   ![](https://s3.ax1x.com/2020/12/30/rL5mK1.png)
5. 配置body的formdata操作和上述雷同(暂不支持文件上传)

### 一键模拟JAVA实体类字段

1. 复制JAVA实体类代码
   ![](https://s3.ax1x.com/2020/12/30/rLqtfK.png)
2. 打开goman切换到Body选项卡，选择Raw-JSON
   ![](https://s3.ax1x.com/2020/12/30/rL7JFf.png)
3. 使用 CTRL+SHIFT+M 一键模拟实体类转JSON
   ![](https://s3.ax1x.com/2020/12/30/rL7JFf.png)
4. 成功JSON格式数据并随机模拟值（第一次使用需要允许相应的权限）
   ![](https://s3.ax1x.com/2020/12/30/rLHi9S.png)

- ps 支持的实体类字段修饰符为 public、private。且仅支持 String、Long、Integer、Double、BigDecimal、Boolean、Date、Object 等基本类型模拟，暂不支持泛型。

## 现有问题

- 一键配置请求头功能使用了clipboard.readText（），可能对某些浏览器暂未支持。兼容性参考 [这里](https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/clipboard) 建议使用Chrome浏览器
- 一键模拟JAVA to JSON 功能如果出现转换异常，请确保修饰符、定义的类型、定义的变量名之间为一个空格！建议先用编辑器先格式化JAVA代码然后复制到goman转换

```java
    private   String   searchValue;  // 解析失败
    private Date createTime; //解析成功
```

# 已发布平台(go1.9.x编译)

web版，可以使用chrome等浏览器，拥有更好的体验

* [goman.v0.4.0.web-win.zip 5.6MB (码云源)](https://gitee.com/zaaksam/goman/attach_files/download?i=118490&u=http%3A%2F%2Ffiles.git.oschina.net%2Fgroup1%2FM00%2F02%2FEC%2FPaAvDFp9iZKAHvm2AFTbbtJOODU736.zip%3Ftoken%3D822e526d3d00d61d831e6936f529d229%26ts%3D1518178278%26attname%3Dgoman.v0.3.1.web-win.zip)

* [goman.v0.4.0.web-mac.tar.gz 6.3MB (码云源)](https://gitee.com/zaaksam/goman/attach_files/download?i=118488&u=http%3A%2F%2Ffiles.git.oschina.net%2Fgroup1%2FM00%2F02%2FEC%2FPaAvDFp9iViAXR8bAGBUYVeP_KU9498.gz%3Ftoken%3Df6573982e125cf28a7e290649818f681%26ts%3D1518178278%26attname%3Dgoman.v0.3.1.web-mac.tar.gz)

app版，独立运行，更简洁，但有些限制

* [goman.v0.4.0.app-win.zip 5.6MB (码云源)](https://gitee.com/zaaksam/goman/attach_files/download?i=118489&u=http%3A%2F%2Ffiles.git.oschina.net%2Fgroup1%2FM00%2F02%2FEC%2FPaAvDFp9iXWAXIDEAFTbaAOyE3Q426.zip%3Ftoken%3Dba1ea69e48a52ca5758cfae63dc173e0%26ts%3D1518178278%26attname%3Dgoman.v0.3.1.app-win.zip) (
  只兼容IE10/IE11内核，请注意升级系统IE浏览器)

* [goman.v0.4.0.app-mac.tar.gz 6.3MB (码云源)](https://gitee.com/zaaksam/goman/attach_files/download?i=118487&u=http%3A%2F%2Ffiles.git.oschina.net%2Fgroup1%2FM00%2F02%2FEC%2FPaAvDFp9iTyAHI4wAGBVuIHKabg0398.gz%3Ftoken%3D3cbf01e6f4af228fbaa9531fea5a8fe0%26ts%3D1518178278%26attname%3Dgoman.v0.3.1.app-mac.tar.gz) (
  已知问题：无法使用复制/粘贴快捷键，但可使用鼠标右键操作)

docker版，更简单的尝鲜使用（docker版本为 v0.3.1）

* `docker pull zaaksam/goman` 或者指定版本 `docker pull zaaksam/goman:v0.3.1`

* `docker run -p 8080:8080 zaaksam/goman`

* 在浏览中打开：`http:127.0.0.1:8080`

注意：docker模式下，goman处在容器内，无法使用 localhost(127.0.0.1) 来请求宿主机的网络资源

# 界面预览

0.4.0版界面相对0.3.1 新增 请求富文本框替换为JSON编辑器，更友好的支持JSON输入、提示、格式化JSON数据等等

windows web版

![](https://static.oschina.net/uploads/img/201802/08120715_zvnn.jpg)

macos web版

![](https://static.oschina.net/uploads/img/201802/08120750_hnI4.jpg)

macos app版 (windows版基本雷同)

![](https://static.oschina.net/uploads/img/201802/08120826_tMsb.jpg)

![](https://static.oschina.net/uploads/img/201802/08120851_rVD1.jpg)

# 技术资源

Backend Go + [Beego](https://github.com/astaxie/beego)

Frontend Typescript + [Vue](https://cn.vuejs.org) + [iView](https://www.iviewui.com)

web版引导界面使用了 [Knockout](http://knockoutjs.com/) + [layui样式](http://www.layui.com)

GUI使用了 https://github.com/zserge/webview

JSON编辑器使用了 [brace](https://www.npmjs.com/package/brace)

请求耗时统计部份参考了 https://github.com/rakyll/hey 代码

# 更新日志

2018-02-09 v0.4.0

* JSON编辑器
* 新增一键配置请求头
* 新增一键配置formdata
* 解决了 GET params 不勾选但还传参的bug
* 取消随机端口。启动app指定端口（默认4399）被占用时，自动寻找可用端口
* 优化打包配置脚本（win环境）

2018-02-09 v0.3.1

* 解决了IE10/IE11的不兼容问题，win app版来了
* 临时解决了mac app版滚动时卡顿问题
* web端心跳包增加了随机数，避免IE缓存
* web端引导页现在不默认打开浏览器了
* web端引导页现在会显示运行的URL地址

2018-02-08 v0.3.0

* 更便捷的web模式运行方式
* web模式下增加了浏览器与应用的互相监测
* docker模式下请求localhost(127.0.01)时会收到警告提示
* app模式建议为实验性质使用
* 简化及增强了各个编译脚本内容

2018-02-03 v0.2.2

* 增加docker镜像编译脚本
* 修改代码支持跨平台条件编译
* 现在访问首页会默认跳往webui地址

2018-02-02 v0.2.1

* 优化构建脚本，更好支持不同平台交叉编译
* 增加不同版本构建main入口

2018-02-01 v0.2.0

* 增加多语方支持，目前支持：简体中文（默认）、英文（不完全）
* 恢复app模式（webview），并默认编译
* 请求支持高级选项模式，可批量请求，并提供统计报告

2017-09-12 v0.1.3

* 拆分webpack为dev、prod环境
* 升级相关依赖项

---

2017-09-10 v0.1.2

* 项目初始化