<template>
    <div>
        <div class="layout-logo">
            {{ title }}
        </div>
        <div class="layout-ceiling-main">
            <!-- <Avatar icon="person" size="small" /> -->
            <ButtonGroup>
                <Button icon="social-github" @click="onGithub"></Button>
<!--                <Button @click="onGitee">码</Button>-->
                <Button @click="onLanguage">{{language}}</Button>
                <Button v-if="isAppMode" icon="refresh" @click="onRefresh"></Button>
            </ButtonGroup>
        </div>
    </div>
</template>

<style>
.layout-ceiling-main {
    float: right;
    margin-right: 15px;
}

.layout-ceiling-main a {
    color: #9ba7b5;
}

.layout-logo {
    width: 100px;
    height: 30px;
    line-height: 30px;
    color: aliceblue;
    background: #5b6270;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 15px;
    left: 20px;
    text-align: center;
}
</style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import iView from 'iview'

@Component
export default class Top extends Vue {
    isCN = true

    get title(): string {
        return C.appName + ' ' + C.appVersion
    }

    get language(): string {
        return this.isCN ? 'EN' : '中文'
    }

    get isAppMode(): boolean {
        return C.runMode === 'app' ? true : false
    }

    onGithub() {
        window.open('https://github.com/i-apples/goman')
    }

    onGitee() {
        window.open('https://gitee.com/zaaksam/goman')
    }

    onLanguage() {
        this.isCN = !this.isCN

        let locale = this.isCN ? 'zh-CN' : 'en-US'
        this.$i18n.locale = locale
    }

    onRefresh() {
        window.location.reload()
    }
}
</script>
