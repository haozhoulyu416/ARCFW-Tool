import fs from "node:fs";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import { visit } from "unist-util-visit";
import { toHtml } from "hast-util-to-html";
import { createWriteStream } from "fs";
import sharp from "sharp";
import purify from "purify-css";
import pp from "css";
const { parse, stringify } = pp;
import { read } from "to-vfile";    
import rehypeStringify from "rehype-stringify";
import rehypeJavaScriptToBottom from "rehype-javascript-to-bottom";
import rehypePresetMinify from "rehype-preset-minify";

import path from  'path'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

// pathName 表示文件根目录的绝对路径
var pathName =  "C:/Users/Haozhou Lyu/Desktop/Web优化能耗/HTML优化能耗/exp1/ExpWebProj01/Poke-Dex-master";


/**
 * all_function_02_v2.js: 集合了所有可操作的降低 carbon footprint 的功能函数，最完整精确的一版
 * pathName: 此版本的文件只需获得文件夹的根目录绝对路径，即可自动进行操作
 */

// 初始化 HTML 文档，复制到并后续操作 ./index_out.html 
function initialInDoc(){
  var orgDocSrc = pathName + '/' + 'index.html';
  var org_doc = path.resolve(__dirname, orgDocSrc);
  var doc = fs.readFileSync(org_doc);
  var tree = unified().use(rehypeParse, { fragment: true }).parse(doc);
  var text = toHtml(tree);
  var outDocSrc = pathName + '/' + 'index_out.html'
  var out_doc = path.resolve(__dirname, outDocSrc);
  var ws = createWriteStream(out_doc, { flags: "w" });
  ws.once("open", function () {
    console.log("initialDoc 写入文件流打开");
  });
  ws.once("close", function () {
    console.log("initialDoc 写入文件流关闭");
  });
  ws.write(text);
  ws.end();
  var inDocSrc = pathName + '/' + 'index_out.html';
  var in_doc = path.resolve(__dirname, inDocSrc);
  console.log("initial in_doc:", in_doc);
  return in_doc;

}

// 1.Function: Compress Image 压缩图片
function compressImg(in_doc,actions_img) {
  console.log("compressImg in_doc:", in_doc);
  return new Promise(resolve => {
  // ./images_compressed 存放着只经过压缩操作的图片
  var outImgSrc = pathName +'/' + 'images_compressed';
  var out_image_file = path.resolve(__dirname, outImgSrc);
  // 创建更改后的 image 文件夹 out_image_file
  if (!fs.existsSync(out_image_file)) {
    fs.mkdirSync(out_image_file);
  }

  // 获取 HTML 中 src = img 的图片所在文件夹
  const doc = fs.readFileSync(in_doc)
  const tree = unified().use(rehypeParse, { fragment: true }).parse(doc)
  var imgFile = []
  visit(tree, (node) => {
      if (node.tagName === 'img') {
          if (node.properties.src.toString().indexOf('http') == -1){
              let str_img = node.properties.src.split('/'+node.properties.src.split('/')[node.properties.src.split('/').length - 1])
              str_img = str_img.filter(item => item != '')
              imgFile.push(str_img[0])
          }
      }
  })
  imgFile = [...new Set(imgFile)]
  console.log('imgFile', imgFile)

  // 压缩图片函数
  let compressWebp = (path_in, path_out, path) =>
    sharp(path_in + "/" + path)
      .toFormat("webp", { quality: 50 })
      .toFile(path_out + "/" + path.split(".")[0] + ".webp");
  let compressJpeg = (path_in, path_out, path) =>
    sharp(path_in + "/" + path)
      .jpeg({ quality: 50, mozjpeg: true })
      .toFile(path_out + "/" + path.split(".")[0] + ".jpeg");
  let compressJpg = (path_in, path_out, path) =>
    //mozjpg: true 压缩图像大小并且不牺牲质量
    sharp(path_in + "/" + path)
      .jpeg({ quality: 50, mozjpeg: true })
      .toFile(path_out + "/" + path.split(".")[0] + ".jpg");
  let compressPng = (path_in, path_out, path) =>
    sharp(path_in + "/" + path)
      .toFormat("png", { quality: 50 })
      .toFile(path_out + "/" + path.split(".")[0] + ".png");

  // 遍历图片文件夹中的图片文件并压缩图片
  for (let i in imgFile){
    var inImgSrc = pathName + '/' + imgFile[i];
    var in_image_file = path.resolve(__dirname, inImgSrc);
    let images = fs.readdirSync(in_image_file)
    for (const path of images) {
      // console.log(path);
      if (path.split(".")[1] === "jpeg") {
        compressJpeg(in_image_file, out_image_file, path);
      } else if (path.split(".")[1] === "png") {
        compressPng(in_image_file, out_image_file, path);
      } else if (path.split(".")[1] === "webp") {
        compressWebp(in_image_file, out_image_file, path);
      } else if (path.split(".")[1] === "jpg") {
        compressJpg(in_image_file, out_image_file, path);
      }
    }
  }
 
  console.log("Finish Compress Images to new folder!")
  // 修改图片后缀
  var arr = actions_img;
  var newcount = 0;
  console.log(arr);
  visit(tree, (node) => {
    if (node.tagName === 'img') {
        if (node.properties.src.toString().indexOf('http') == -1){
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == 1 && newcount == i) {
            node.properties.src = node.properties.src.replace(
              node.properties.src.split('/'+node.properties.src.split('/')[node.properties.src.split('/').length - 1]).join(""),
              'images_compressed'
              );
        }}
        console.log(node.properties.src);
        newcount ++;
    }    
    }
});


console.log("###### Create the New Version of HTML #######");
  var text = toHtml(tree);
  var outDocSrc = pathName + '/' + 'index_out.html'
  var out_doc = path.resolve(__dirname, outDocSrc);
  var ws = createWriteStream(out_doc, { flags: "w" });
  ws.once("open", function () {
    console.log("compressImg 写入文件流打开");
  });
  ws.once("close", function () {
    console.log("compressImg 写入文件流关闭");
  });
  ws.write(text);
  ws.end();

  resolve();
})
}

// 2.Function: Convert Image Format 转换图片格式
function convertImg(in_doc, actions_img,actions) {
  console.log("convertImg in_doc:", in_doc);
  return new Promise(resolve => {
  // 如果之前未执行 compressImg()
  if(actions[4] == 0){
    // ./images_converted 文件中存放着只有转换格式操作的图片
    var outImgSrc = pathName +'/' + 'images_converted';
    var out_image_file = path.resolve(__dirname, outImgSrc);
    // 创建更改后的 image 文件夹 out_image_file
    if (!fs.existsSync(out_image_file)) {
      fs.mkdirSync(out_image_file);
    }

    // 获取 HTML 中 src = img 的图片所在文件夹
    const doc = fs.readFileSync(in_doc)
    const tree = unified().use(rehypeParse, { fragment: true }).parse(doc)
    var imgFile = []
    visit(tree, (node) => {
        if (node.tagName === 'img') {
            if (node.properties.src.toString().indexOf('http') == -1){
                let str_img = node.properties.src.split('/'+node.properties.src.split('/')[node.properties.src.split('/').length - 1])
                str_img = str_img.filter(item => item != '')
                imgFile.push(str_img[0])
            }
        }
    })
    imgFile = [...new Set(imgFile)]
    console.log('imgFile', imgFile)

    // 转换图片格式函数
    let toWebp = (path_in, path_out, path) =>
      sharp(path_in + "/" + path)
        .toFormat("webp", { nearLossless: true })
        .toFile(path_out + "/" + path.split(".")[0] + ".webp");
    let toJpeg = (path_in, path_out, path) =>
      sharp(path_in + "/" + path)
        .toFormat("jpeg", { mozjpeg: true })
        .toFile(path_out + "/" + path.split(".")[0] + ".jpeg");
    let toJpg = (path_in, path_out, path) =>
      sharp(path_in + "/" + path)
        .toFormat("jpg", { mozjpeg: true })
        .toFile(path_out + "/" + path.split(".")[0] + ".jpg");

  // 遍历图片文件夹中的图片文件并格式转换
  for (var i in imgFile){
    var inImgSrc = pathName + '/' + imgFile[i];
    var in_image_file = path.resolve(__dirname, inImgSrc);
    let images = fs.readdirSync(in_image_file)
    for (const path of images) {
        if (path.split('.')[1] === 'png') {
            toJpg(in_image_file, out_image_file, path)
        }
        else if(path.split('.')[1] === 'jpg') {
            toJpg(in_image_file, out_image_file, path)
        }
        else if(path.split('.')[1] === 'jpeg') {
          toJpg(in_image_file, out_image_file, path)
      }
    }
}
  //修改图片后缀
  var arr = actions_img;
  var newcount = 0;
  console.log(arr);
  //修改图片路径及后缀
  visit(tree, (node) => {
    if (node.tagName === 'img') {
        if (node.properties.src.toString().indexOf('http') == -1 ){
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == 1 && newcount == i) {
                if(node.properties.src.toString().indexOf('images_out') == -1){
            node.properties.src = node.properties.src.replace(
                // 将 html 中出现的 src = img 的图片标签都改为 images_out 中
                node.properties.src.split('/'+node.properties.src.split('/')[node.properties.src.split('/').length - 1]).join(""),
                'images_converted'
              );}
        node.properties.src = node.properties.src.replace('png', 'jpg')
        node.properties.src = node.properties.src.replace('jpeg', 'jpg')
        }}
        console.log(node.properties.src);
        newcount ++;
    }    
    }
  } 
  );

  var text = toHtml(tree);
  var outDocSrc = pathName + '/' + 'index_out.html'
  var out_doc = path.resolve(__dirname, outDocSrc);
  var ws = createWriteStream(out_doc, { flags: "w" });
  ws.once("open", function () {
    console.log("convertImg 写入文件流打开");
  });
  ws.once("close", function () {
    console.log("convertImg 写入文件流关闭");
  });
  ws.write(text);
  ws.end();

}
// 如果之前执行过 CompressImg：
else{
  // 转换图片格式函数
  let toWebp = (path_in, path_out, path) =>
    sharp(path_in + "/" + path)
      .toFormat("webp", { nearLossless: true })
      .toFile(path_out + "/" + path.split(".")[0] + ".webp");
  let toJpeg = (path_in, path_out, path) =>
    sharp(path_in + "/" + path)
      .toFormat("jpeg", { mozjpeg: true })
      .toFile(path_out + "/" + path.split(".")[0] + ".jpeg");
  let toJpg = (path_in, path_out, path) =>
    sharp(path_in + "/" + path)
      .toFormat("jpg", { mozjpeg: true })
      .toFile(path_out + "/" + path.split(".")[0] + ".jpg");

  // ./images_compressed_converted 存放着经过压缩和转换格式两个操作的图片
  var imeImgSrc = pathName +'/' + 'images_compressed';
  var ime_image_file = path.resolve(__dirname, imeImgSrc);
  let images = fs.readdirSync(ime_image_file)
  var in_image = ime_image_file;
  var outSrc = pathName +'/' + 'images_compressed_converted';
  var out_image = path.resolve(__dirname, outSrc);
  if (!fs.existsSync(out_image)) {
    fs.mkdirSync(out_image);
  }
  for (const path of images) {
    console.log("-----",path)
      if (path.split('.')[1] === 'png') {
          toJpg(in_image, out_image, path)
      }
      else if(path.split('.')[1] === 'jpg') {
          toJpg(in_image, out_image, path)
      }
      else if(path.split('.')[1] === 'jpeg') {
        toJpg(in_image, out_image, path)
    }
  }
var arr = actions_img;
var newcount = 0;
const doc = fs.readFileSync(in_doc)
const tree = unified().use(rehypeParse, { fragment: true }).parse(doc)
//修改图片路径及后缀
visit(tree, (node) => {
  if (node.tagName === 'img') {
      if (node.properties.src.toString().indexOf('http') == -1 ){
      for (let i = 0; i < arr.length; i++) {
          if (arr[i] == 1 && newcount == i) {
              if(node.properties.src.toString().indexOf('images_out') == -1){
          node.properties.src = node.properties.src.replace(
              // 将 html 中出现的 src = img 的图片标签都改为 images_out 中
              node.properties.src.split('/'+node.properties.src.split('/')[node.properties.src.split('/').length - 1]).join(""),
              'images_compressed_converted'
            );}
      node.properties.src = node.properties.src.replace('png', 'jpg')
      node.properties.src = node.properties.src.replace('jpeg', 'jpg')
      }}
      console.log(node.properties.src);
      newcount ++;
  }    
  }
} 
);

console.log("###### Create the New Version of HTML #######");
  var text = toHtml(tree);
  var outDocSrc = pathName + '/' + 'index_out.html'
  var out_doc = path.resolve(__dirname, outDocSrc);
  var ws = createWriteStream(in_doc, { flags: "w" });
  ws.once("open", function () {
    console.log("compressImg 写入文件流打开");
  });
  ws.once("close", function () {
    console.log("compressImg 写入文件流关闭");
  });
  ws.write(text);
  ws.end();

}
  resolve();
  })
}

// 3.Function: Remove unused css and change the original css file. 删除未使用的css
function removeUnusedCSS(in_doc, actions) {
  return new Promise(resolve => {
  console.log("removeUnusedCSS in_doc:", in_doc);
  var doc = fs.readFileSync(in_doc);
  var tree = unified().use(rehypeParse, { fragment: true }).parse(doc);
  if(actions[1] == 0){
    // 遍历 HTML文件 获取 href的.css
    var cssHrefFile = [];
    visit(tree, (node) => {
      if (node.tagName === "link") {
        if (
          node.properties.href.indexOf("http") == -1 &&
          node.properties.href.indexOf(".css") != -1
        ) {
          cssHrefFile.push(node.properties.href);
        }
      }
    });

    // 遍历 CSS 文件 并 生成新的修改后的 _out.css 文件
    for (let i in cssHrefFile) {
      var in_css_src = pathName + "/" + cssHrefFile[i];
      var in_css = path.resolve(__dirname, in_css_src);
      var out_css_src =
        pathName + "/" + cssHrefFile[i].split(".")[0] + "_out.css";
      var out_css = path.resolve(__dirname, out_css_src);
      console.log(in_css);
      console.log(out_css);
      var content = [in_doc];
      var css = [in_css];
      var options = {
        // Will write purified CSS to this file.
        minify: true,
        output: out_css,
        rejected: true,
      };
      purify(content, css, options);
      console.log("Finish pruify")
    }

    // 修改 HTML 中 href = .css 的文件名称为 _out.css
    visit(tree, (node) => {
      if (node.tagName === "link") {
        if (
          node.properties.href.indexOf("http") == -1 &&
          node.properties.href.indexOf(".css") != -1
        ) {
          node.properties.href = node.properties.href.replace(
            node.properties.href.split("." +node.properties.href.split(".")[node.properties.href.split(".").length - 1]).join(""),
            node.properties.href.split("." +node.properties.href.split(".")[node.properties.href.split(".").length - 1]).join("") + "_out"
          );
        }
      }
    });

    var text = toHtml(tree);
    var ws = createWriteStream(in_doc, { flags: "w" });
    ws.once("open", function () {
      console.log("removeUnusedCSS 写入文件流打开");
    });
    ws.once("close", function () {
      console.log("removeUnusedCSS 写入文件流关闭");
    });
    ws.write(text);
    ws.end();
}
else{
      // 遍历 HTML文件 获取 href的.css
      var cssHrefFile = [];
      visit(tree, (node) => {
        if (node.tagName === "link") {
          if (
            node.properties.href.indexOf("http") == -1 &&
            node.properties.href.indexOf(".css") != -1
          ) {
            cssHrefFile.push(node.properties.href);
          }
        }
      });
  
      // 遍历 CSS 文件 并 生成新的修改后的 _out.css 文件
      for (let i in cssHrefFile) {
        var in_css_src = pathName + "/" + cssHrefFile[i];
        var in_css = path.resolve(__dirname, in_css_src);
        var out_css = in_css;
        console.log(in_css);
        console.log(out_css);
        var content = [in_doc];
        var css = [in_css];
        var options = {
          // Will write purified CSS to this file.
          minify: true,
          output: out_css,
          rejected: true,
        };
        purify(content, css, options);
        console.log("Finish Remove Unused CSS Pruify")
      }
}
resolve();
  })
}

// 4.Function: Convert the HTML tag <span> to <strong> 改变HTML tag
function convertSpanToStrong(in_doc) {
  return new Promise(resolve => {
  console.log("convertSpanToStrong in_doc:", in_doc);
  var doc = fs.readFileSync(in_doc);
  var tree = unified().use(rehypeParse, { fragment: true }).parse(doc);

  visit(tree, (node) => {
    if (node.tagName === "span") {
      node.tagName = node.tagName.replace("span", "strong");
      if (node.properties.style != null) {
        node.properties.style = node.properties.style.replace(
          "font-weight: bold;",
          ""
        );
      }
      console.log(node);
    }
  });

  var text = toHtml(tree);
  var ws = createWriteStream(in_doc, { flags: "w" });
  ws.once("open", function () {
    console.log("convertSpanToStrong 写入文件流打开");
  });
  ws.once("close", function () {
    console.log("convertSpanToStrong 写入文件流关闭");
  });
  ws.write(text);
  ws.end();
  resolve();
})
}

// 5.Function: Remove CSS's opacity and update the CSS file. 
function removeOpacity(in_doc) {
    return new Promise(resolve => {
    console.log("removeOpacity in_doc:", in_doc);
    var doc = fs.readFileSync(in_doc);
    var tree = unified().use(rehypeParse, { fragment: true }).parse(doc);
    // 遍历 HTML文件 获取 href的.css
    var cssHrefFile = [];
    visit(tree, (node) => {
      if (node.tagName === "link") {
        if (
          node.properties.href.indexOf("http") == -1 &&
          node.properties.href.indexOf(".css") != -1
        ) {
          cssHrefFile.push(node.properties.href);
        }
      }
    });

    // 遍历 CSS 文件 并 生成新的修改后的 _out.css 文件
    for (let i in cssHrefFile) {
      var in_css_src = pathName + "/" + cssHrefFile[i];
      var in_css = path.resolve(__dirname, in_css_src);
      var out_css_src = pathName + "/" + cssHrefFile[i].split(".")[0] + "_out.css";
      var out_css = path.resolve(__dirname, out_css_src);
      console.log(in_css);
      console.log(out_css);

      const cssString = fs.readFileSync(in_css).toString();
      var obj = parse(cssString);
      for (const cssclass in obj.stylesheet.rules) {
        for (const pronum in obj.stylesheet.rules[cssclass].declarations) {
          if ( obj.stylesheet.rules[cssclass].declarations[pronum].property == "opacity"
          ) {
            obj.stylesheet.rules[cssclass].declarations[pronum].value = "1";
          }
        }
      }
      var result = stringify(obj);
      var ws = createWriteStream(out_css, { flags: "w" });
      ws.once("open", function () {
        console.log("out_css 写入流打开");
      });
      ws.once("close", function () {
        console.log("out_css 写入流关闭");
      });
      ws.write(result);
      ws.end();
    }

    // 修改 HTML 中 href = .css 的文件名称为 _out.css
    visit(tree, (node) => {
      if (node.tagName === "link") {
        if ( node.properties.href.indexOf("http") == -1 && node.properties.href.indexOf(".css") != -1)
        {
          console.log(node.properties.href);
          console.log(node.properties.href.split("." +node.properties.href.split(".")[node.properties.href.split(".").length - 1]).join(""));
          if(node.properties.href.indexOf("_out") == -1){
          node.properties.href = node.properties.href.replace(
            node.properties.href.split("." +node.properties.href.split(".")[node.properties.href.split(".").length - 1]).join(""),
            node.properties.href.split("." +node.properties.href.split(".")[node.properties.href.split(".").length - 1]).join("") + "_out"
          );}
        }
      }
    });
    
    console.log("###### Create the New Version of HTML #######");
    var text = toHtml(tree);
    var ws = createWriteStream(in_doc, { flags: "w" });
    ws.once("open", function () {
      console.log("removeOpacity 写入流打开");
    });
    ws.once("close", function () {
      console.log("removeOpacity 写入流关闭");
    });
    ws.write(text);
    ws.end();

    resolve();
    })
}

// 6.Function: Move Script to bottom in HTML file. 改变 Script 位置
async function moveScriptBottom(in_doc) {
  console.log("moveJS in_doc:", in_doc)
  const file = await unified()
    .use(rehypeParse)
    .use(rehypeJavaScriptToBottom)
    .use(rehypeStringify)
    .process(await read(in_doc));

  //console.log(String(file));
  var text = String(file);
  var ws = createWriteStream(in_doc, { flags: "w" });
  ws.once("open", function () {
    console.log("moveScriptBottom 写入流打开");
  });
  ws.once("close", function () {
    console.log("moveScriptBottom 写入流关闭");
  });
  ws.write(text);
  ws.end();
}

// 7.Function: Remove HTML whitespace
async function removeHTMLSpace() {
  const file = await unified()
    .use(rehypeParse)
    //This package is a unified (rehype) preset to minify HTML.  'rehype-preset-minify'
    .use(rehypePresetMinify)
    .use(rehypeStringify)
    .process(await read(in_doc));

  console.log(String(file));
  // 将 remove whitespce 后的 html 文件重新写入
  var text = String(file);
  var ws = createWriteStream(in_doc, { flags: "w" });
  ws.once("open", function () {
    console.log("流打开啦~~~");
  });
  ws.once("close", function () {
    console.log("流关闭啦~~~");
  });
  ws.write(text);
  ws.end();
}

// 生成最终版本的 html. Convert tree to HTML text and write to the new HTML file: index_out_allfuc.html
async function convertTreeToText(tree) {
  return new Promise(resolve => {
  console.log("###### Create the New Version of HTML #######");
  var text = toHtml(tree);
  var outDocSrc = pathName + '/' + 'index_out.html'
  var out_doc = path.resolve(__dirname, outDocSrc);
  // var out_doc = path.resolve(__dirname, 'Ecommerce-Website-main/index_out.html')
  var ws = createWriteStream(out_doc, { flags: "w" });
  ws.once("open", function () {
    console.log("流打开啦~~~");
  });
  ws.once("close", function () {
    console.log("流关闭啦~~~");
  });
  ws.write(text);
  ws.end();
  resolve();
})
}

// 将 图片数量传到 img_count.json
function sendImgNumToJSON() {
  var count = 0;
  visit(tree, (node) => {
    if (node.tagName === "img") {
      count = count + 1;
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
}

// 等待时间函数
function timeout(ms) {
  return new Promise((resolve, reject) => {
      setTimeout(resolve, ms, 'done');
  });
}

// 根据数组actions执行各种函数
function runFunctions() {
  fs.readFile(
    "E:/Lighthouse/lighthouseTest1/newsolution_data.json",
    "utf-8",
    function (err, data) {
      if (err) {
        return console.log("文件读取失败！" + err.message);
      }
      // 若文件写入成功，将显示“文件写入成功”
      console.log("文件读取成功！");
      //a = data;
      //console.log(data);
      var actions = JSON.parse(data).actions;
      var actions_img = JSON.parse(data).actions_img;
      console.log(actions);
      console.log(actions_img);
      var in_doc = initialInDoc();
      async function run(){
        if (actions[0] == 1){
          await moveScriptBottom(in_doc);
        }
        if(actions[1] == 1){
          timeout(100).then(() => {removeOpacity(in_doc)});
        }
        if(actions[2] == 1){
          timeout(200).then(() => {convertSpanToStrong(in_doc)});
        }
        if(actions[3] == 1){
          timeout(300).then(() => { removeUnusedCSS(in_doc,actions)});
        }
        if(actions[4] == 1){
          timeout(600).then(() => { compressImg(in_doc,actions_img)});
        }
        if(actions[5] == 1){
          timeout(2000).then(() => { convertImg(in_doc,actions_img,actions)});
        }
      }
      timeout(1000).then(() => {run(in_doc)})
    }
  );
}

runFunctions();
