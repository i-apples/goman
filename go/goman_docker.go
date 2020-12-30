// +build linux

package goman

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/logs"
	"github.com/i-apples/goman/go/config"
)

func run(mode string) {
	config.AppConf.RunMode = config.RUN_MODE_DOCKER
	logs.Info("====== 欢迎使用 " + config.AppConf.Name + " " + config.AppConf.Version + " ======")
	beego.Run()
}
