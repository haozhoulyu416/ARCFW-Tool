import { writeFileSync } from 'fs';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import jsonplus from 'jsonplus';
import fs from 'fs';

// 读取待测网页，用 Lighthouse 测量该网页的 data-byte-weight 和 time-to-interative，并返回 json 写入文件.
async function getReportTotalBytes() {
    var pageurl = "";
    fs.readFile("E:/Lighthouse/lighthouseTest1/newsolution_data.json", "utf-8", function(err, data){
        if(err){
            return console.log('文件读取失败！'+err.message);
        }
        // 若文件写入成功，将显示“文件写入成功”
        console.log('文件读取成功！');
        //a = data;
        //console.log(data);
        pageurl = JSON.parse(data).pageurl;
        console.log(pageurl);
    })

    const chrome = await launch({ chromeFlags: ['--headless'] });
    const options = { logLevel: 'info', output: 'json', onlyCategories: ['performance'], port: chrome.port, perset: "desktop",
                    throttlingMethod: 'simulate'};
    const runnerResult = await lighthouse(pageurl, options);
    const reportHtml = runnerResult.report;
    writeFileSync('lhreport.json', reportHtml);

    await chrome.kill();

    // Parse lighthouse report json. Get total-byte-weight.
    var response = jsonplus.parse(reportHtml)
    var len = response["audits"]["total-byte-weight"]["details"]["items"].length

    let byteslist = []
    let totalbytesnum = 0
    for (let i = 0; i < len; i++) {
        let url = response["audits"]["total-byte-weight"]["details"]["items"][i]["url"]
        let bytes = response["audits"]["total-byte-weight"]["details"]["items"][i]["totalBytes"]
        let list1 = [url, bytes]
        byteslist.push(list1)
        totalbytesnum += response["audits"]["total-byte-weight"]["details"]["items"][i]["totalBytes"]
    }
    // Get Time-to-interactive.
    var interactive_time = response["audits"]["interactive"]["numericValue"]

    var info = {"total_byte_weight": totalbytesnum, "time_to_interactive": interactive_time}
    return info;

}


var info = await getReportTotalBytes();
console.log(info);

// stringify json
var jsonContent = JSON.stringify(info);
console.log(jsonContent);

fs.writeFile("E:/Lighthouse/lighthouseTest1/carbon_data.json",jsonContent,function(err){
    // 如果err为true，则文件写入失败，并返回失败信息
    if(err){
        return console.log('文件写入失败！'+err.message)
    }
    // 若文件写入成功，将显示“文件写入成功”
    console.log('文件写入成功！')
})

