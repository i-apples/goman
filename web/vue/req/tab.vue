<template>
    <div>
        <Form>
            <Form-item>
                <Row type="flex">
                    <Col :xs="18" :sm="19" :md="20" :lg="21">
                    <Input v-model="req.url" :placeholder="$t('goman.req.tab.urlTips')" style="width:100%;" :disabled="isSending" @on-change="onURLChange">
                    <Select v-model="req.method" slot="prepend" style="width:100px" :disabled="isSending">
                        <Option v-for="item in methodOptions" :value="item" :key="item">{{ item }}</Option>
                    </Select>
                    <Button slot="append" style="width:100px" :disabled="isSending" @click="onParamsShow">{{$t('goman.req.tab.params')}}</Button>
                    </Input>
                    </Col>
                    <Col :xs="6" :sm="5" :md="4" :lg="3" style="display:flex;justify-content:flex-end;">
                    <Button-group>
                        <Button @click="onSend" type="primary" icon="android-send" :loading="isSending">{{$t('goman.req.tab.send')}}</Button>&nbsp;
                        <Button @click="onAdvanced" type="primary" :icon="advancedIcon" :disabled="isSending"></Button>
                    </Button-group>
                    </Col>
                </Row>
            </Form-item>
            <Form-item v-show="showParams">
                <ReqList :listData="params" :isSending="isSending" @onChange="onParamsChange" :selectChange.sync="selected"></ReqList>
            </Form-item>
            <Form-item v-show="isAdvanced">
                <Card style="width:100%;">
                    <div slot="title">{{$t('goman.req.tab.advanced.title')}}</div>
                    <div>
                        {{$t('goman.req.tab.advanced.requests')}}：
                        <InputNumber v-model="reqN" :min="1" :step="1" :precision="0" :disabled="isSending"></InputNumber>&nbsp;&nbsp; {{$t('goman.req.tab.advanced.concurrency')}}：
                        <InputNumber v-model="reqC" :min="1" :step="1" :precision="0" :disabled="isSending"></InputNumber>&nbsp;&nbsp; {{$t('goman.req.tab.advanced.timeout')}}：
                        <InputNumber v-model="reqTimeout" :min="5" :step="1" :precision="0" :disabled="isSending"></InputNumber>&nbsp;{{$t('goman.req.tab.advanced.timeoutUnit')}}&nbsp;&nbsp;
                    </div>
                </Card>
            </Form-item>
            <Form-item>
                <Card style="width:100%;">
                    <div slot="title">{{$t('goman.req.tab.request.title')}}</div>
                    <div>
                        <Tabs :animated="false" v-model="reqMode">
                            <Tab-pane label="Body" name="Body" :disabled="!isBody">
                                <div style="padding-bottom:10px;">
                                    <RadioGroup v-model="bodyMode" size="large">
                                        <Radio label="normal">x-www-form-urlencoded</Radio>
                                        <Radio label="raw">raw</Radio>
                                    </RadioGroup>
                                    <Select v-model="rawContentType" :disabled="!isBodyRaw" style="width:220px;" :transfer="true">
                                        <Option value="text">Text</Option>
                                        <Option value="text/plain">Text(text/plain)</Option>
                                        <Option value="application/json">JSON(application/json)</Option>
                                        <Option value="application/javascript">Javascript(application/javascript)</Option>
                                        <Option value="application/xml">XML(application/xml)</Option>
                                        <Option value="text/xml">XML(text/xml)</Option>
                                        <Option value="text/html">HTML(text/html)</Option>
                                    </Select>
                                </div>
                                <ReqList v-show="!isBodyRaw" :listData="bodys" :isSending="isSending"></ReqList>
<!--                                <Input v-show="isBodyRaw" v-model="body" type="textarea" :rows="10"></Input>-->
                                <div class="em-editor__editor" v-show="isBodyRaw">
                                    <div ref="codeEditor" id="codeEditor"></div>
                                </div>
                            </Tab-pane>
                            <Tab-pane :label="headersLabel" name="Headers">
                                <ReqList :listData="headers" :isSending="isSending" :isHeaders="true" :contentType="contentType"></ReqList>
                            </Tab-pane>
                            <Tab-pane :label="$t('goman.req.tab.request.code')" name="Code">
                                <pre class="mypre">{{ code }}</pre>
                            </Tab-pane>
                        </Tabs>
                    </div>
                </Card>
            </Form-item>
            <Form-item v-show="isAdvanced">
                <ReqReport :tabID="tab.id" :start="start" :resList="resList"></ReqReport>
            </Form-item>
            <Form-item v-show="isAdvanced" style="text-align:center">
                <Button :icon="previewIcon" :type="previewType" @click="onPreview">{{$t('goman.req.tab.showPreview')}}</Button>
            </Form-item>
            <Form-item v-show="isPreview">
                <ReqPre :isAdvanced="isAdvanced" :resList="resList"></ReqPre>
            </Form-item>
        </Form>
    </div>
</template>

<style>
.mypre {
    overflow: auto;
    overflow-y: hidden;
}
.em-editor__editor {
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.em-editor__editor > div {
    height:500px;
}
</style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import _ from 'lodash'
import moment from 'moment'
import API from '../../ts/api'
import ReqList from './list.vue'
import ReqPre from './pre.vue'
import ReqReport from './report.vue'
import { CreateElement } from 'vue/types/vue'
import jsBeautify from 'js-beautify/js/lib/beautify'
import * as ace from 'brace';
import {arr2Obj, array2Obj, splitParams, checkLangJava, queryParams} from '../utils/index'
import 'brace/mode/javascript';
import 'brace/theme/monokai';
import 'brace/ext/language_tools'
import 'brace/ext/searchbox'
import {Editor} from "brace";
import hotkeys from 'hotkeys-js';


interface IOptions {
    label: string
    value: string
}

@Component({
    components: {
        ReqList,
        ReqPre,
        ReqReport
    }
})
export default class Tab extends Vue {
    @Prop() tab: Req.TabModel

    advancedIcon = 'ios-arrow-down'
    isAdvanced = true
    previewIcon = 'ios-arrow-down'
    previewType = 'primary'
    isPreview = true
    isSending = false
    reqMode: 'Body' | 'Headers' | 'Code' = 'Body'
    contentType = ''
    headers: Req.ListModel[] = [
        {
            isDisable: false,
            id: 'ls0',
            key: 'User-Agent',
            value: C.userAgent,
            desc: '',
            checked:true
        },
        {
            isDisable: false,
            id: 'ls1',
            key: 'Cookie',
            value: '',
            desc: '',
            checked:true
        },
        {
            isDisable: false,
            id: 'ls2',
            key: 'authorization',
            value: '',
            desc: '',
            checked:true
        }
    ]
    params: Req.ListModel[] = []
    bodys: Req.ListModel[] = []
    body: string = '{"data": {}}'
    bodyMode: 'normal' | 'raw' = 'raw'

    reqN: number = 10
    reqC: number = 10
    reqTimeout: number = 20

    req: Req.RequestModel = {
        n: 0,
        c: 0,
        timeout: 0,
        method: 'POST',
        url: '',
        headers: {},
        body: ''
    }

    start: number = 0
    resList: Req.ResponseModel[] = []

    methodOptions: string[] = ['GET', 'POST', 'HEAD', 'PUT', 'DELETE']
    rawContentType: string = 'application/json'
    showParams: boolean = true
    codeEditor: any = null
    selected: Array<object> = []
    rollBack: Array<any> = []

    created() {
        this.onLocale()
    }

    @Watch('$i18n.locale')
    onLocale() {
        this.onTabLabelChange()
    }

    @Watch('selected')
    selectChange(newVal: Array<object>, oldVal: Array<object>) {
        const {url} = this.req
        const index = url.indexOf('?')

        if (newVal.length) {
          const newObj = arr2Obj(newVal, {setKey: 'key', setValue: 'value'})

            const replaceStr = url.substring(0, index)
            this.req.url = index >= 0 ? replaceStr + queryParams(newObj, 0) : url + queryParams(newObj, 0)
        } else if (index >= 0) {
            this.req.url = url.substring(0, index)
        } else {

        }
    }

    mounted() {
        const el:any = this.$refs.codeEditor
        this.codeEditor = ace.edit(el)
        this.codeEditor.getSession().setMode('ace/mode/javascript')
        this.codeEditor.setTheme('ace/theme/monokai')
        this.codeEditor.setOption('tabSize', 2)
        this.codeEditor.setOption('fontSize', 15)
        this.codeEditor.setOption('enableLiveAutocompletion', true)
        // this.codeEditor.setOption('enableSnippets', true)
        this.codeEditor.clearSelection()
        this.codeEditor.getSession().setUseWorker(false)
        this.codeEditor.on('change', this.onChange)
        this.codeEditor.commands.addCommands([{
          name: 'format',
          bindKey: {win: 'Ctrl-Shift-F', mac: 'Ctrl-Shift-F'},
          exec: () => {
            this.format()
          }
        }, {
          name: 'mockData',
          bindKey: {win: 'Ctrl-Shift-M', mac: 'Ctrl-Shift-C'},
          exec: (codeEditor: any) => {
            const txt: string = codeEditor.getValue()

            try {
              this.codeEditor.setValue(jsBeautify.js_beautify(JSON.stringify(array2Obj(checkLangJava(txt))), {indent_size: 2}))
            } catch (e) {
              const title = '转换错误：' + e
              this.$Modal.warning({title})
            }
          }
        }])

        hotkeys('ctrl+shift+s', async (event: any, handler: any) => {
          event.preventDefault();
          this.setCopyData(this.reqMode)
        })

        hotkeys('ctrl+shift+z', async (event: any, handler: any) => {
          event.preventDefault();
          this.handleRollBack()
        })

        hotkeys('ctrl+s', (event: any, handler: any) => {
          event.preventDefault()
          this.onSend()
        });

      this.$nextTick(() => {
            this.isAdvanced = false
            this.onParamsShow()
            this.codeEditor.setValue(this.body)
            this.format()
        })
    }

    format () {
        const context = this.codeEditor.getValue()
        let code = /^http(s)?/.test(context)
            ? context
            : jsBeautify.js_beautify(context, { indent_size: 2 })
        this.codeEditor.setValue(code)
    }

    onChange () {
        this.body = this.codeEditor.getValue()
    }

    onPreview() {
        this.isPreview = !this.isPreview

        if (this.isPreview) {
            this.previewIcon = 'ios-arrow-up'
            this.previewType = 'success'
        } else {
            this.previewIcon = 'ios-arrow-down'
            this.previewType = 'primary'
        }
    }

    onParamsShow() {
        this.showParams = !this.showParams
    }

    /**
     * 根据params变动，更新url及tab.label
     */
    onParamsChange() {
        let url = this.req.url
        let index = url.indexOf('?')
        if (index != -1) {
            url = url.substr(0, index)
        }

        let pmStr = ''
        _.forEach(this.params, (pm, k) => {
            console.log(pm)
            if (pm.isDisable) {
                return
            }

            if (pmStr != '') {
                pmStr += '&'
            }
            pmStr += pm.key + '=' + pm.value
        })

        this.req.url = pmStr == '' ? url : url + '?' + pmStr
        this.onTabLabelChange()
    }

    /**
     * 根据url变动，更新params及tab.label
     */
    onURLChange(event: any) {
        this.onTabLabelChange()

        if (this.req.url == '') {
            return
        }

        let url = this.req.url
        let index = url.indexOf('?')
        if (index == -1) {
            this.params = []
            return
        }

        let pmStr = url.substr(index + 1)
        if (pmStr == '') {
            return
        }

        let params: Req.ListModel[] = []
        let pms = pmStr.split('&')
        //遍历参数
        _.forEach(pms, pm => {
            if (pm == '') {
                return
            }

            let key = ''
            let value = ''
            index = pm.indexOf('=')
            if (index == -1) {
                key = pm
            } else {
                key = pm.substr(0, index)
                value = pm.substr(index + 1)
            }

            params.push({
                isDisable: false,
                id:
                    'ls' +
                    moment()
                        .valueOf()
                        .toString(),
                key: key,
                value: value,
                desc: '',
                checked:true
            })
        })

        this.params = params
    }

    onTabLabelChange() {
        let label = this.req.url
        if (label.trim() == '') {
            label = this.$t('goman.req.tab.title').toString()
        }

        this.tab.label = label.length > 18 ? label.substr(0, 18) : label
    }

    onAdvanced() {
        this.isAdvanced = !this.isAdvanced

        if (this.isAdvanced) {
            this.advancedIcon = 'ios-arrow-up'
            this.isPreview = false
        } else {
            this.advancedIcon = 'ios-arrow-down'
            this.isPreview = true
        }
    }

    async onSend() {
        if (
            C.runMode === 'docker' &&
            (this.req.url.indexOf('127.0.0.1') != -1 ||
                this.req.url.toLowerCase().indexOf('localhost') != -1)
        ) {
            this.$Modal.warning({
                title: this.$t('goman.req.tab.modal.title').toString(),
                content: this.$t('goman.req.tab.modal.content').toString(),
                okText: this.$t('goman.req.tab.modal.okText').toString()
            })
            return
        }

        this.isSending = true
        this.resList = []

        if (this.isAdvanced) {
            this.req.n = this.reqN
            this.req.c = this.reqC
            this.req.timeout = this.reqTimeout
        } else {
            this.req.n = 1
            this.req.c = 1
            this.req.timeout = 0
        }

        this.req.headers = {}
        _.forEach(this.headers, v => {
            if (!v.isDisable) {
                if (this.req.headers[v.key]) {
                    this.req.headers[v.key].push(v.value)
                } else {
                    this.req.headers[v.key] = [v.value]
                }
            }
        })

        this.req.body = ''
        if (this.isBody) {
            if (this.isBodyRaw) {
                this.req.body = this.body
            } else {
                _.forEach(this.bodys, v => {
                    if (!v.isDisable) {
                        if (this.req.body != '') {
                            this.req.body += '&'
                        }

                        this.req.body +=
                            v.key + '=' + encodeURIComponent(v.value)
                    }
                })
            }
        }

        let data = new URLSearchParams()
        data.append('req', JSON.stringify(this.req))

        this.start = moment().valueOf()
        let result = await API.post<Req.ResponseModel[]>('/req', data)
        if (result.code == 10000) {
            if (result.data && result.data.length > 0) {
                this.resList = result.data
            }
        } else {
            this.$Message.error({
                duration: 5,
                content: result.msg + '(' + result.code.toString() + ')'
            })
        }

        this.isSending = false
    }

    get headersLabel(): string {
        let label = 'Headers'

        if (this.headers.length > 0) {
            label += '(' + this.headers.length.toString() + ')'
        }

        return label
    }

    get isBody(): boolean {
        let isBody = this.req.method != 'GET' && this.req.method != 'HEAD'
        if (!isBody && this.reqMode === 'Body') {
            this.reqMode = 'Headers'
        }

        return isBody
    }

    get isBodyRaw(): boolean {
        let isBodyRaw = this.bodyMode == 'raw'

        if (this.isBody) {
            this.contentType = isBodyRaw
                ? this.rawContentType
                : 'x-www-form-urlencoded'
        }

        return isBodyRaw
    }

    get code(): string {
        let urls: string[]
        let path: string
        let hosts = this.req.url.split('://')
        if (hosts.length > 1) {
            urls = hosts[1].split('/')
            path = hosts[1]
        } else {
            urls = hosts[0].split('/')
            path = hosts[0]
        }

        let host = urls[0]
        path = urls.length > 1 ? _.replace(path, host, '') : ''

        let code = this.req.method + ' ' + path + ' ' + 'HTTP/1.1'
        code += '\nHost: ' + host

        _.forEach(this.headers, v => {
            if (!v.isDisable) {
                code += '\n' + v.key + ': ' + v.value
            }
        })

        code += '\n'

        if (this.isBody) {
            if (this.isBodyRaw) {
                code += '\n' + this.body
            } else {
                let i = 0
                _.forEach(this.bodys, v => {
                    if (!v.isDisable) {
                        code += i == 0 ? '\n' : '&'
                        code += v.key + '=' + encodeURIComponent(v.value)
                        i++
                    }
                })
            }
        }

        return code
    }

    async setCopyData(type: string) {
      const navigator: any = window.navigator
      const copyTxt = await navigator.clipboard.readText()
      let target: string = ''
      let handle: Req.ListModel[] = []
      let headers: Req.ListModel[] = this.headers

      this.$Spin.show();

      switch (type) {
        case "Body":
          const isBodyRaw = this.isBodyRaw

          if (isBodyRaw) {
            try {
              this.codeEditor.setValue(jsBeautify.js_beautify(copyTxt, {indent_size: 2}))
            } catch (e) {
              this.$Spin.hide()
              alert('失败')
              return
            }
          } else {
            try {
              console.info('解析Json对象')

              const txt2Obj = JSON.parse(JSON.parse(JSON.stringify(copyTxt)))
              let forIndex: number = 0

              _.forIn(txt2Obj, function (value, key) {

                if (value && value.constructor == String) {
                  forIndex += 1
                  handle.push({
                    desc: "",
                    id: 'ls' +
                        moment() + forIndex
                            .valueOf()
                            .toString(),
                    isDisable: false,
                    checked: true,
                    key,
                    value
                  })
                }
              })

            } catch (e) {
              handle = splitParams(copyTxt).map((e: any, i: number) => {
                const {key, value} = e

                e = {
                  desc: "",
                  id: 'ls' +
                      moment() + i
                          .valueOf()
                          .toString(),
                  isDisable: false,
                  checked: true,
                  key,
                  value
                }

                return e
              })
            }
          }

          target = 'bodys'
          break;
        case "Headers":
          const copyHeaders = splitParams(await copyTxt).map((e: any, index: number) => {
            const {key, value} = e
            e = {
              desc: "",
              id: 'ls' +
                  moment() + index
                      .valueOf()
                      .toString(),
              isDisable: false,
              checked: true,
              key,
              value
            }
            return e
          })

          if (!copyHeaders.length) {
            this.$Spin.hide()
            this.$Message.error({content: '复制请求头失败'})
            return
          }

          handle = _.orderBy(_.unionBy(copyHeaders, headers, 'key'), ['id'], ['asc'])

          target = 'headers'
          break;
        default:
          break;
      }

      this.rollBack.push({
        target: target.toString(),
        handle: JSON.parse(JSON.stringify(this[target]))
      })

      this[target] = handle
      const clearCodeTime: number = 7

      this.$Spin.hide()
      this.$Message.success({
        duration: 10,
        render: h => {
          return h('span', [
            h('span', `操作成功！你仍然可在${clearCodeTime}秒内点击`),
            h('a', {
              style: {'color': 'red'},
              domProps: {
                innerHTML: '撤回',
              },
              on: {
                click: () => {
                  this.handleRollBack()
                }
              },
            }),
            ' 按钮'
          ])
        }
      });
    }

    handleRollBack() {
      const rollbackList = this['rollBack']

      console.info(rollbackList)

      if (!rollbackList.length) {
        this.$Message.error({content: '暂时没有可撤回的内容'})
        return
      }

      const {target, handle} = _.last(rollbackList)
      this[target] = handle
      this['rollBack'].pop()
    }
}
</script>
