import Mock from 'mockjs'

export const queryParams = function (data: any, way: any) {
    let _result: any;
    if (way == 0) {
        let res: Array<string> = []
        for (let key in data) {
            let value: string = data[key]
            // 去掉为空的参数
            if (['', undefined, null].includes(value)) {
                continue
            }
            if (value.constructor === Array) {
                // value.forEach(_value => {
                //     res.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(_value))
                // })
            } else {
                res.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
            }
        }

        _result = res.length ? '?' + res.join('&') : ''
    } else if (way == 1) {
        let res = {};
        data = decodeURIComponent(data)
        const arr1 = data.split("?");
        if (arr1.length > 1) {
            const arr2 = arr1[1].split("&");
            for (let i = 0; i < arr2.length; i++) {
                const res = arr2[i].split("=");
                res[res[0]] = res[1];
            }
        }
        _result = res;
    }

    return _result;
}

export const arr2Obj = function (array: Array<Object>, props?: object) {
    const _default: object = {
        setKey: 'key',
        setValue: 'value',
    }

    const options: object = Object.assign({}, _default, props)

    return array.reduce((acc: object, item: Object, index: number) => {
        acc[item[options['setKey']]] = item[options['setValue']]
        return acc
    }, {})
}

export const splitParams = function (header: string, separiaror: string = '\n') {
    return header.split(separiaror).reduce((acc: Array<object>, item: string, index: number) => {
        const splitKey: string = ':'
        // 代理请求头判断
        const splitIndex: number = item.indexOf(splitKey) == 0 ? item.indexOf(splitKey, 1) : item.indexOf(splitKey)

        if (splitIndex < 0) {
            return acc
        }

        const key: string = item.substring(0, splitIndex).trim()

        const value: string = item.substring(splitIndex + 1, item.length).trim()

        acc.push({key, value,})

        return acc
    }, [])
}

export const checkLangJava = function (java: string) {
    const supportModifier: Array<string> = ['public', 'private']
    const supportDataType: Array<string> = ['String', 'Long', 'Integer', 'Double', 'BigDecimal', 'Boolean', 'Date', 'Object', 'List', 'Map']

    const res: Array<object> = java.split('\n').reduce((acc: Array<object>, item: string, index: number) => {
        const searchKey: string = ' '
        let modifier: string, dataType: string, variable: string;

        item = item.trim()

        const firstEnmptyStr: number = item.indexOf(searchKey)
        const lastEnmptyStr: number = item.lastIndexOf(searchKey)

        modifier = item.substring(0, firstEnmptyStr)
        variable = item.substring(lastEnmptyStr + 1, item.length - 1)
        dataType = item.substring(firstEnmptyStr + 1, lastEnmptyStr)

        const isSupport: boolean = supportModifier.some((e: any) => e.indexOf(modifier)) && supportDataType.some((e: any) => e == dataType)

        if (!isSupport) {
            return acc
        }

        acc.push({
            key: variable,
            value: mockData(dataType)
        })
        return acc
    }, [])
    return res
}

export const array2Obj = function (array: Array<any>) {
    return array.reduce((acc: object, item: any, index: number) => {
        acc[item['key']] = item['value']
        return acc
    }, {})
}

export const mockData = function (dataType: string | Array<string>) {
    let supportDataType: Array<string> = ['String', 'Long', 'Integer', 'Double', 'BigDecimal', 'Boolean', 'Date', 'Object', 'List', 'Map']
    let result: any = null, mockObj: any, ignore: Array<string> = [];

    switch (dataType) {
        case 'String':
            result = Mock.mock('@cword(1,10)')
            break;
        case 'Long':
            result = Mock.mock({"number|1-100": 1}).number
            break;
        case 'Integer':
            result = Mock.mock({"number|1-1000.1-5": 1}).number
            break;
        case 'Double':
            result = Mock.mock({"number|1-10000.1-5": 1}).number
            break;
        case 'BigDecimal':
            result = Mock.mock({"number|1-999999999.1-5": 1}).number
            break;
        case 'Object':
            ignore = ['Object', 'Map']
            mockObj = supportDataType.reduce((acc: Object, item: string, index: number) => {
                if (ignore.some(e => e.includes(item))) {
                    return acc
                }
                const key = Mock.mock('@word(1,5)')
                const val = mockData(item)
                acc[key] = val
                return acc
            }, {})
            result = Mock.mock({
                "object|1-10": mockObj
            }).object
            break;
        case 'Boolean':
            result = Mock.mock('@boolean')
            break;
        case 'Date':
            result = Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")')
            break;
        case 'List':
            ignore = ['List', 'Map']
            supportDataType = supportDataType.reduce((acc: Array<string>, item: string, index: number) => {
                if (ignore.some(e => e.includes(item))) {
                    return acc
                }
                acc.push(item)
                return acc
            }, []).sort((a: string, b: string) => Math.random() > .5 ? -1 : 1);

            const min: number = 0
            const max: number = supportDataType.length
            const roundNum: number = parseInt((Math.random() * (max - min) + min).toString())
            mockObj = []
            for (let i = 0; i < 3; i++) {
                let roundType = supportDataType[roundNum]
                mockObj.push(roundType)
            }

            result = Mock.mock({
                "array|1-10": mockData(mockObj)
            }).array
            break;
        default:
            break;
    }

    if (Array.isArray(dataType)) {
        result = [];
        dataType.forEach(e => {
            result.push(mockData(e))
        })
    }

    return result;
}
