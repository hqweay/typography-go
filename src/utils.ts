import { fetchSyncPost } from "siyuan";

interface IgnoreBlock {
  start: number;
  end: number;
}

import { standardNames } from "./standardName";

class FormatUtil {
  //获取当前文档id
  getDocid() {
    return document
      .querySelector(
        ".layout__wnd--active .protyle.fn__flex-1:not(.fn__none) .protyle-background"
      )
      ?.getAttribute("data-node-id");
  }
  getCurrentDocument() {
    return document.querySelector("[data-doc-type=NodeDocument]");
  }

  condenseContent(content: any) {
    // 将 制表符 改成 四个空格
    content = content.replace(/\t/g, "    ");
    // 删除超过2个的回车
    // Unix 的只有 LF，Windows 的需要 CR LF
    content = content.replace(/(\n){3,}/g, "$1$1");
    content = content.replace(/(\r\n){3,}/g, "$1$1");
    return content;
  }

  getIgnoreBlocks(lines: any, token = "```") {
    const ignoreBlocks: any = [];
    let block: any = null;
    lines.forEach((line: any, index: any) => {
      line = line.trim();
      if (line.startsWith(token)) {
        if (!block) {
          block = { start: index, end: null };
        } else {
          if (line === token) {
            block.end = index;
            ignoreBlocks.push(block);
            block = null;
          }
        }
      }
    });
    return ignoreBlocks;
  }
  deleteSpaces(content: any) {
    // 去掉「`()[]{}<>'"`」: 前后多余的空格
    content = content.replace(/\s+([\(\)\[\]\{\}<>'":])\s+/g, " $1 ");
    // 去掉连续括号增加的空格，例如：「` ( [ { <  > } ] ) `」
    content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, "$1$2 ");
    content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, "$1$2 ");
    content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, "$1$2 ");
    content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, "$1$2 ");
    content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, " $1$2");
    content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, " $1$2");
    content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, " $1$2");
    content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, " $1$2");

    // 去掉 「`$ () $`」, 「`$ [] $`」, 「`$ {} $`」 里面增加的空格
    // 去掉开始 $ 后面增加的空格，结束 $ 前面增加的空格
    // 去掉包裹代码的符号里面增加的空格
    // 去掉开始 ` 后面增加的空格，结束 ` 前面增加的空格 `hello()`
    content = content.replace(
      /([`\$])\s*([<\(\[\{])([^\$]*)\s*([`\$])/g,
      "$1$2$3$4"
    );
    content = content.replace(
      /([`\$])\s*([^\$]*)([>\)\]\}])\s*([`\$])/g,
      "$1$2$3$4"
    );
    // 去掉「`) _`」、「`) ^`」增加的空格
    content = content.replace(/\)\s([_\^])/g, ")$1");
    // 去掉 [^footnote,2002] 中的空格
    content = content.replace(/\[\s*\^([^\]\s]*)\s*\]/g, "[^$1]");
    // 将链接的格式中文括号“[]（）”改成英文括号“[]()”，去掉增加的空格
    content = content.replace(
      /\s*\[\s*([^\]]+)\s*\]\s*[（(]\s*([^\s\)]*)\s*[)）]\s*/g,
      " [$1]($2) "
    );

    // ![](https://img.com/a.jpg)

    content = content.replace(/\!\[\]\(/g, "![img](");

    // 给双链增加空格 add，不管 ![[wikilink]] ==[[wikilink]]==
    // [[wikilink]]
    // 我爱[[wikilink]]
    // content = content.replace(/\s*[^!=，。、`]\[\[\s*([^\]]+)\s*\]\]\s*/g, ' [[$1]] ');
    // content = content.replace(/\s*([^!=`-])\s*\[\[\s*([^\]]+)\s*\]\]\s*/g, '$1 [[$2]] ');
    // content = content.replace(/([，。、《》？『』「」；：【】｛｝—！＠￥％…（）])\[\[\s*(.*)\s*\]\]\s*/g, '$1[[$2]] ');
    // content = content.replace(/\s*\[\[\s*([^\]]+)\s*\]\]\s*/g, " [[$1]] ");
    // content = content.replace(/\=\=\s\[\[([^\]]+)\]\]\s\=\=/g, "==[[$1]]==");
    // content = content.replace(/\!\s\[\[([^\]]+)\]\]/g, "![[$1]]");

    // 删除链接和中文标点的空格 add
    // content = content.replace(
    //   /([\]\)])\s*([，。、《》？『』「」；：【】｛｝—！＠￥％…（）])/g,
    //   "$1$2"
    // );
    // content = content.replace(
    //   /([，。、《》？『』「」；：【】｛｝—！＠￥％…（）])\s*([\[\()])/g,
    //   "$1$2"
    // );
    // 删除行首非列表的空格 add
    content = content.replace(/^\s*([\[\(])/g, "$1");

    //fix bug 20240414 将图片链接的格式中的多余空格“! []()”去掉，变成“![]()”
    content = content.replace(
      /!\s*\[\s*([^\]]+)\s*\]\s*[（(]\s*([^\s\)]*)\s*[)）]\s*/g,
      "![$1]($2) "
    );
    // 将图片链接的。改为.
    // content = content.replace(/!\[\[(.*)。(.*)\]\]/g, "![[$1.$2]]");
    // 将网络地址中“ : // ”符号改成“://”
    // content = content.replace(/\s*:\s*\/\s*\/\s*/g, "://");

    //去掉多余空格
    //fix bug 20240414
    content = content.replace(/\s+([!,.;?])/g, "$1");
    content = content.replace(/([!,.;?])\s+/g, "$1 ");

    content = content.replace(/\s*([!,.;?])\s*([”’])/g, "$1$2");

    // 去掉行末空格——这个规则会影响 行内元素：I am <span>fine</span>. --> I am<span>fine</span>.
    // content = content.replace(/(\S*)\s*$/g, "$1");

    // content = content.replace(/(^-$)/g, "$1 "); // - outliner 加空格

    // 去掉「123 °」和 「15 %」中的空格
    content = content.replace(/([0-9])\s*([°%])/g, "$1$2");
    // 去掉 2020 - 04 - 20, 08 : 00 : 00 这种日期时间表示的数字内的空格
    content = content.replace(/([0-9])\s*-\s*([0-9])/g, "$1-$2");
    content = content.replace(/([0-9])\s*:\s*([0-9])/g, "$1:$2");
    // 去掉 1 , 234 , 567 这种千分位表示的数字内的空格
    content = content.replace(/([0-9])\s*,\s*([0-9])/g, "$1,$2");

    //去掉 「，  哈哈。 」这样的空格
    // content = content.replace(/([^-])\s*([，。、《》？『』「」；∶【】&｛｝！＠￥％…（）])\s*/g, "$1$2");
    content = content.replace(
      /\s*([，。、《》？『』「」；∶【】｛｝！＠￥％…（）])\s*/g,
      "$1"
    ); // not & like: Tom & Jerry

    // - ！ 哈安  --- 保留这样的空格
    // content = content.replace(
    //   /-([，。、《》？『』「」；∶【】&｛｝！＠￥％…（）])\s*/g,
    //   "- $1"
    // );
    // content = content.replace(
    //   /##([，。、《》？『』「」；∶【】&｛｝！＠￥％…（）])\s*/g,
    //   "## $1"
    // ); // ##【哈哈】：这样的标题得保留空格
    // content = content.replace(/-\s*([？&！＠￥％])\s*/g, "- $1 "); // - ！ 提醒事项：这样的行内备注 保留空格

    // 全角標點與其他字符之間不加空格
    // 将无序列表的-后面的空格保留
    // 将有序列表的-后面的空格保留
    content = content.replace(
      /^(?<![-|\d.]\s*)\s*([，。、《》？『』「」；∶【】｛｝—！＠￥％…（）])\s*/g,
      "$1"
    );
    return content;
  }

  insertSpace(content: any) {
    // 在 “中文English” 之间加入空格 “中文 English”
    // 在 “中文123” 之间加入空格 “中文 123”
    content = content.replace(
      /(?<!\[.*\]\(.*)([\u4e00-\u9fa5\u3040-\u30FF])([a-zA-Z0-9`])/g,
      "$1 $2"
    );
    // 在 “English中文” 之间加入空格 “English 中文”
    // 在 “123中文” 之间加入空格 “123 中文”
    content = content.replace(
      /(?<!\[.*\]\(.*)([a-zA-Z0-9%`])([*]*[\u4e00-\u9fa5\u3040-\u30FF])/g,
      "$1 $2"
    );
    // 在 「I said:it's a good news」的冒号与英文之间加入空格 「I said: it's a good news」
    content = content.replace(/([:])\s*([a-zA-z])/g, "$1 $2");
    return content;
  }

  replacePunctuations(content: any) {
    // `, \ . : ; ? !` 改成 `，、。：；？！`

    //... 替换为中文省略号  add
    content = content.replace(/[.]{3,}/g, "……");
    // 必须在结尾或者有空格的点才被改成句号
    content = content.replace(
      /([\u4e00-\u9fa5\u3040-\u30FF])\.($|\s*)/g,
      "$1。"
    );
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]),/g, "$1，");
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]);/g, "$1；");
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]):/g, "$1：");
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])!/g, "$1！");
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\?/g, "$1？");
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\\/g, "$1、");
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])＼s*\:/g, "$1：");
    // content = content.replace(
    //   /\(([\u4e00-\u9fa5\u3040-\u30FF]+.*?[\u4e00-\u9fa5\u3040-\u30FF]?)\)/g,
    //   "（$1）"
    // );

    // 不包含引用块才换
    if (!/`.*?`/.test(content)) {
      //先把分号换成引号
      content = content.replace(/"(.*?)"/g, "“$1”");
    }

    // 簡體中文使用直角引號
    content = content.replace(/‘/g, "『");
    content = content.replace(/’/g, "』");
    content = content.replace(/“/g, "「");
    content = content.replace(/”/g, "」");

    // content = content.replace(/“(.*?[\u4e00-\u9fa5\u3040-\u30FF])”/g, "「$1」");
    // content = content.replace(/“([\u4e00-\u9fa5\u3040-\u30FF].*?)”/g, "「$1」");

    content = content.replace(
      /（([!@#$%^&*()_+-=\[\]{};':"./<>【】「」《》]*\w.*?[!@#$%^&*()_+-=\[\]{};':"./<>]*)）/g,
      " ($1) "
    );

    // (my 我的)
    // (我的 milk)
    content = content.replace(
      /\((.*?[\u4e00-\u9fa5\u3040-\u30FF])\)/g,
      "（$1）"
    );
    content = content.replace(
      /\(([\u4e00-\u9fa5\u3040-\u30FF].*?)\)/g,
      "（$1）"
    );
    // 英文和数字内部的全角标点 `，。；‘’“”：？！＠＃％＆－＝＋｛｝【】｜＼～`改成半角标点
    content = content.replace(/(\w)\s*，\s*(\w)/g, "$1, $2");
    content = content.replace(/(\w)\s*。\s*(\w)/g, "$1. $2");
    content = content.replace(/(\w)\s*。\s*(”)/g, "$1. $2");
    content = content.replace(/(\w)\s*；\s*(\w)/g, "$1; $2");
    // content = content.replace(/(\w)\s*：\s*(\w)/g, "$1: $2");
    content = content.replace(/(\w)\s*：\s*/g, "$1: ");
    content = content.replace(/(\w)\s*？\s*(\w)/g, "$1? $2");
    content = content.replace(/(\w)\s*！\s*(\w)/g, "$1! $2");
    content = content.replace(/(\w)\s*＠\s*(\w)/g, "$1@$2");
    content = content.replace(/(\w)\s*＃\s*(\w)/g, "$1#$2");
    content = content.replace(/(\w)\s*％\s*(\w)/g, "$1 % $2");
    content = content.replace(/(\w)\s*＆\s*(\w)/g, "$1 & $2");
    content = content.replace(/(\w)\s*－\s*(\w)/g, "$1 - $2");
    content = content.replace(/(\w)\s*＝\s*(\w)/g, "$1 = $2");
    content = content.replace(/(\w)\s*＋\s*(\w)/g, "$1 + $2");
    content = content.replace(/(\w)\s*｛\s*(\w)/g, "$1 {$2");
    content = content.replace(/(\w)\s*｝\s*(\w)/g, "$1} $2");
    content = content.replace(/(\w)\s*[【\[]\s*(\w)/g, "$1 [$2");
    content = content.replace(/(\w)\s*[】\]]\s*(\w)/g, "$1] $2");
    content = content.replace(/(\w)\s*｜\s*(\w)/g, "$1 | $2");
    content = content.replace(/(\w)\s*＼\s*(\w)/g, "$1  $2");
    content = content.replace(/(\w)\s*～\s*(\w)/g, "$1~$2");

    content = content.replace(
      /(\w[:;,.!?\'\"]?[:;,.!?\'\"]?)\s*「\s*(\w)/g,
      "$1 “$2"
    );
    content = content.replace(/(\w[,.!?]?)\s*」\s*([「]?\w?)/g, "$1” $2");
    content = content.replace(/(\w)\s*『\s*(\w)/g, "$1‘f$2");
    content = content.replace(/(\w)\s*』\s*(\w)/g, "$1’$2");
    content = content.replace(/(\b\w+')\s(\w*\b)/g, "$1$2");

    content = content.replace(/「(.*?)"/g, "「$1」");
    content = content.replace(/「(.*?)”/g, "「$1」");
    content = content.replace(/"(.*?)」/g, "「$1」");
    //20240414 fix bug：将 “fact” 「哈哈」 也匹配了
    // content = content.replace(/“(\w.*?\w?)」/g, "“$1”");
    content = content.replace(/“(\w.*?\w)」/g, "“$1”");
    content = content.replace(/'(\w.*?\w)”/g, "“$1”");
    // 过滤一下 <div id = ""

    content = content.replace(/(\w)'(\w)?/g, "$1’$2");

    content = content.replace(/\s*「(\w.*?\w[,.!?]?)」\s*/g, " “$1” ");
    content = content.replace(/“(\w)」/g, "“$1”");
    content = content.replace(/「(\w)”/g, "“$1”");

    content = content.replace(/”\s*([,.!?]\1?)/g, "”$1");

    // 连续三个以上的 `。` 改成 `......`
    content = content.replace(/[。]{3,}/g, "……");

    // 截断连续超过一个的 ？和！ 为一个，「！？」也算一个
    content = content.replace(/([！？]+)\1{1,}/g, "$1");
    // 截断连续超过一个的 。，；：、“”『』〖〗《》 为一个
    content = content.replace(/([。，；：、“”『』〖〗《》【】])\1{1,}/g, "$1");
    // content = content.replace(
    //   /\{\s*:\s*id\s*=\s*“(.*?)”\s*updated\s*=\s*“(.*?)”\s*\}/g,
    //   '{: id="$1" updated="$2"}'
    // );
    // content = content.replace(
    //   /\{\s*:\s*updated\s*=\s*“(.*?)”\s*id\s*=\s*“(.*?)”\s*\}/g,
    //   '{: id="$1" updated="$2"}'
    // );
    //todo
    // content = content.replace(/updated\s*=\s*“(.*?)”/g, 'updated="$1"');
    // content = content.replace(/id\s*=\s*“(.*?)”/g, 'id="$1"');
    // content = content.replace(/(updated=".*")\s*\}/g, "$1}");
    // content = content.replace(/(id=".*")\s*\}/g, "$1}");

    content = content.replace(/\*\*(.*?)\s*\*\*/g, "**$1**");

    // content = content.replace(/\*\*(.*?)\s*\*\*/g, "**$1**");

    standardNames.forEach((ele: any) => {
      content = content.replace(ele.key, ele.value);
    });
    return content;
    // let lines = content.split("\n");
    // for (let index = 0; index < lines.length; index++) {
    //   lines[index] = lines[index].trim();
    // }
    // return lines.join("\n");
  }

  replaceFullNumbersAndChars(content: any) {
    // 替换全角数字 & 全角英文
    // Ａ -> A
    // ０ -> 0
    return content.replace(/[\uFF10-\uFF19\uFF21-\uFF5A]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    );
  }

  formatContent(content: any) {
    // 替换所有的全角数字和字母为半角
    content = this.replaceFullNumbersAndChars(content);
    // 删除多余的内容（回车）
    content = this.condenseContent(content);

    // 每行操作
    const lines = content.split("\n");
    const ignoreBlocks: IgnoreBlock[] = this.getIgnoreBlocks(lines);
    // const pattern = /\{:\supdated=".*\sid=".*\}/;
    // const pattern = /\{:.*\}/;

    //过滤：
    /**
     * {: fsd }
- {: fsd }
> {: fsd }
  {: updated="20240331182021" id="20240331182021-ux1ltc4"}
     */
    const filterPattern = /^(\*\s*)?(-\s*)?(>\s*)?(\s*)?\{:.*\}$/;
    const formatPattern = /(\{:.*?\})/;
    const jumpPatterns = [
      /^(\s*)?(\*\s*)?(-\s*)?(>\s*)?(\s*)?\{:.*\}$/,
      /\(\(.*\)\)/,
      /\[\[.*\]\]/,
      /\{\{.*\}\}/,
    ];

    content = lines
      .map((line: any, index: any) => {
        // 忽略代码块
        if (
          ignoreBlocks.some(({ start, end }) => {
            return index >= start && index <= end;
          })
        ) {
          return line;
        }
        for (let index = 0; index < jumpPatterns.length; index++) {
          if (jumpPatterns[index].test(line)) {
            return line;
          }
        }
        // console.log("+++++++");
        // console.log(line);
        // console.log("+++++++");
        const matches = formatPattern.exec(line);
        if (matches) {
          if (matches[1]) {
            let splits = line.split(matches[1]);
            if (splits.length == 2) {
              //略过((这是))、[[还会]]
              for (let index = 0; index < jumpPatterns.length; index++) {
                if (jumpPatterns[index].test(splits[1])) {
                  return line;
                }
              }

              return (
                splits[0] + matches[1] + this.replacePunctuations(splits[1])
              );
            }
          }
          return line;
        }
        //中文文档内的英文标点替换为中文标点
        line = this.replacePunctuations(line);
        // 将无编号列表的“* ”改成 “- ”
        // 将无编号列表的“- ”改成 “- ”
        // line = line.replace(/^(\s*)[-\*]\s+(\S)/, "$1- $2");
        // 删除多余的空格
        line = this.deleteSpaces(line);
        // 插入必要的空格
        // line = this.insertSpace(line);
        // 将有编号列表的“1.  ”改成 “1. ”
        // line = line.replace(/^(\s*)(\d\.)\s+(\S)/, "$1$2 $3");

        // console.log("更新后的");
        // console.log(line);
        // console.log("更新后的");
        return line;
      })
      .join("\n");
    // 结束文档整理前再删除最后一个回车
    content = content.replace(/(\n){2,}$/g, "$1");
    content = content.replace(/(\r\n){2,}$/g, "$1");
    return content;
  }
}

export let formatUtil = new FormatUtil();
