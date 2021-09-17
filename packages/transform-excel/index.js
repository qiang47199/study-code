const fs = require('fs');
const path = require('path');
const xlsx2json = require('node-xlsx');

init();
/**
 * 初始化函数 
 */
function init() {
    // 读取 自定义目录 或 当前目录下文件
    const filePath = process.argv.splice(2) || path.resolve('./csv-files');
    const fileNames = fs.readdirSync(filePath);
    const csvNames = (fileNames || []).filter((e) => e.indexOf('.csv') > -1);

    if (csvNames.length === 0) {
        console.log('没有需要生成的文件');
    } else {
        getAllCsvFileContent(csvNames, filePath);
    }
}

/**
 * 获取所有csv文件内容
 * @param {Array<string>} csvNames 所有csv文件名称
 * @param {string} filePath 文件路径
 */
function getAllCsvFileContent(csvNames, filePath) {
    try {
        let csvDataList = [];
        csvNames.forEach((fileName) => {
            const list = xlsx2json.parse(`${filePath}/${fileName}`);
            const orginList = (list[0].data || []).splice(2); // base: 过滤前两条数据title数据
            orginList.forEach((e) => {
                const [empty, url, pv, uv, ip, time] = e;
                if (typeof url === 'string' && url.startsWith('http')) {
                    csvDataList.push({
                        url,
                        pv: pv || 0,
                        uv: uv || 0,
                        ip: ip || 0,
                        time: time || '',
                    })
                }
            })
        })
        const data = handleMergeData(csvDataList);
        handleExportExcel(data);
    } catch (e) {
        console.log(e, '数据获取失败');
    }
}

/**
 * 导出文件
 */
function handleExportExcel(data) {
    const headers = ['url', 'pv', 'uv', 'ip', 'time', 'urlType'];
    let obj = {};
    data.forEach((item) => {
        const { system } = item || {};
        let listItemData = headers.map((headerKey) => item[headerKey]);
        if (obj[system]) {
            obj[system].push(listItemData);
        } else {
            obj[system] = [listItemData];
        }
    })
    // 根据系统维度拆分数据表格
    const buffer = xlsx2json.build(Object.keys(obj).map((system) => {
        obj[system].unshift(headers);
        return {
            name: system,
            data: obj[system],
        }
    }));
    let time = new Date().getTime();
    fs.writeFileSync(`./数据文件${time}.xlsx`, buffer, { 'flag': 'w' });
}
/**
 * 合并处理详情页面路由数据格式
 */
function handleMergeData(originData) {
    let obj = {};
    const reg = /\d|(-1)|\?/; // 检测 cuPage/312 、 cuPage/-1 、 abc?a=1&c=2
    originData.forEach((item) => {
        let key = item.url;
        let urlType = 'originUrl';
        if (reg.test(key)) {
            key = key.split(reg)[0];
            urlType = 'paramsUrl';
        }
        /\/#\/([A-z|-]*)\/|\/(pop)\/#\//.test(key); // 截取系统前缀

        if (obj[key]) {
            const oldData = obj[key];
            obj[key] = {
                ...oldData,
                url: key,
                pv: (Number(oldData.pv) || 0) + (Number(item.pv) || 0),
                uv: (Number(oldData.uv) || 0) + (Number(item.uv) || 0),
                ip: (Number(oldData.ip) || 0) + (Number(item.ip) || 0),
                time: oldData.time || item.time || '',
            }
        } else {
            obj[key] = {
                ...item,
                url: key,
                urlType,
                system: RegExp.$1,
            }
        }
    });

    return Object.keys(obj)
        .map((key) => obj[key]);
}



