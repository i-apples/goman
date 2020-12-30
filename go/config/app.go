package config

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

// AppConf 应用全局参数
var AppConf appConf

func init() {
	AppConf.goos = runtime.GOOS
	AppConf.goarch = runtime.GOARCH

	if AppConf.goos == "windows" {
		AppConf.OS = OS_TYPE_WINDOWS
	} else if AppConf.goos == "darwin" {
		AppConf.OS = OS_TYPE_DARWIN
	} else if AppConf.goos == "linux" {
		AppConf.OS = OS_TYPE_LINUX
	}

	if AppConf.OS == OS_TYPE_UNSUPPORT {
		panic("不支持 " + AppConf.goos + " 系统的编译运行")
	}

	if AppConf.goarch == "amd64" {
		AppConf.Arch = ARCH_TYPE_AMD64
	}

	if AppConf.Arch == ARCH_TYPE_UNSUPPORT {
		panic("不支持 " + AppConf.goarch + " 核心的编译运行")
	}

	mode := ""
	flag.BoolVar(&AppConf.Debug, "debug", false, "调试模式，默认：false")
	flag.StringVar(&AppConf.IP, "ip", "127.0.0.1", "监听的IP地址，默认：127.0.0.1")
	flag.IntVar(&AppConf.Port, "port", 4399, "服务端口，默认：随机")
	flag.StringVar(&mode, "mode", "app", "运行模式：web：Web模式；app：App模式(试验)；默认：app")
	flag.Parse()

	if AppConf.IP == "" {
		AppConf.IP = "127.0.0.1"
	}

	fmt.Println(AppConf)
	AppConf.Port = newPort(AppConf.IP, AppConf.Port)

	AppConf.Host = fmt.Sprintf("http://%s:%d", AppConf.IP, AppConf.Port)

	switch strings.ToLower(mode) {
	case "web":
		AppConf.RunMode = RUN_MODE_WEB
	case "app":
		AppConf.RunMode = RUN_MODE_APP
	default:
		AppConf.RunMode = RUN_MODE_WEB
	}

	AppConf.Name = "goman"
	AppConf.Version = "0.4.0"
	AppConf.Started = time.Now().Unix()
}

type appConf struct {
	goos    string
	goarch  string
	OS      OSType
	Arch    ArchType
	Name    string
	Version string
	Debug   bool
	Host    string
	IP      string
	Port    int
	Started int64
	RunMode RunModeType
}

func LocalIp() string {
	var finalIp string
	cmd := exec.Command("cmd", "/c", "ipconfig")
	if out, err := cmd.StdoutPipe(); err != nil {
		fmt.Println(err)
	} else {
		defer out.Close()
		if err := cmd.Start(); err != nil {
			fmt.Println(err)
		}

		if opBytes, err := ioutil.ReadAll(out); err != nil {
			log.Fatal(err)
		} else {
			str := string(opBytes)

			var strs = strings.Split(str, "\r\n")

			if 0 != len(strs) {
				var havingFinalIp4 bool = false
				var cnt int = 0
				for index, value := range strs {
					vidx := strings.Index(value, "IPv4")
					//说明已经找到该ip
					if vidx != -1 {
						ip4lines := strings.Split(value, ":")
						if len(ip4lines) == 2 {
							cnt = index
							havingFinalIp4 = true
							ip4str := ip4lines[1]
							finalIp = strings.TrimSpace(ip4str)
						}

					}
					if havingFinalIp4 && index == cnt+2 {
						lindex := strings.Index(value, ":")
						if -1 != lindex {
							lines := strings.Split(value, ":")
							if len(lines) == 2 {
								fip := lines[1]
								if strings.TrimSpace(fip) != "" {
									break
								}
							}
						}
						havingFinalIp4 = false
						finalIp = ""
					}
				}
			}
		}
	}
	return finalIp
}

//newPort 查找可用端口
func newPort(ip string, defProt int) int {
	i := 4000
	for {
		min := 4000
		max := 10000

		r := rand.New(rand.NewSource(time.Now().UnixNano()))

		var port int
		if checkProt(port, min, max) {
			port = r.Intn(60000)
		} else {
			port = defProt
		}

		//fmt.Println(port)
		//fmt.Println("端口被占用")
		if port <= 0 {
			continue
		}

		conn, err := net.Dial("tcp", fmt.Sprintf("%s:%d", ip, port))
		if err != nil {
			if strings.Contains(err.Error(), "refused") && checkProt(port, min, max) {
				return port
			}

			i++
			continue
		} else {
			// 端口被占用
			//fmt.Println("端口被占用")
			conn.Close()
			return newPort(ip, port+1)
		}
	}
}

func checkProt(port, minPort int, maxPort int) bool {
	if port > minPort && port < maxPort {
		//fmt.Println("端口没问题")
		return true
	} else {
		//fmt.Println("端口有问题")
		return false
	}
}
