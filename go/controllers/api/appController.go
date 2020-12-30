package api

import (
	"github.com/i-apples/goman/go/services"
)

type AppController struct {
	BaseController
}

func (c *AppController) Get() {
	//心跳
	services.App.Heartbeat()
}
