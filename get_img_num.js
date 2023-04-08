import fs from 'node:fs'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import { visit } from 'unist-util-visit'
import path from  'path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'  
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

var pathName =  "C:/Users/Haozhou Lyu/Desktop/Web优化能耗/HTML优化能耗/exp1/ExpWebProj01/Poke-Dex-master";
let mypath = path.resolve(__dirname, pathName+'/index.html')

// var in_doc = "./Poke-Dex-master/index.html";
const doc = fs.readFileSync(mypath);
const tree = unified().use(rehypeParse, { fragment: true }).parse(doc);

var count = 0;
visit(tree, (node) => {
  if (node.tagName === "img") {
    if (node.properties.src.toString().indexOf('http') == -1 ){
    count = count + 1;
  }
}
});
// 将image数量传值进 img_count.json
var img_count = JSON.stringify(count);
fs.writeFile(
  "E:/Lighthouse/lighthouseTest1/img_count.json",
  img_count,
  function (err) {
    if (err) {
      return console.log("文件写入失败！" + err.message);
    }
    console.log("文件写入成功！");
  }
);
