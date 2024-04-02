import {
  Plugin,
  showMessage,
  confirm,
  Dialog,
  Menu,
  openTab,
  adaptHotkey,
  getFrontend,
  getBackend,
  IModel,
  Setting,
  fetchPost,
  Protyle,
  fetchSyncPost,
} from "siyuan";
import "./index.scss";
import { formatUtil } from "./utils";

const STORAGE_NAME = "typography-go-config";

export default class PluginSample extends Plugin {
  private customTab: () => IModel;
  private isMobile: boolean;

  onload() {
    this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

    const frontEnd = getFrontend();
    this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
    // 图标的制作参见帮助文档
    this.addIcons(`<symbol id="iconFace" viewBox="0 0 32 32">
<svg t="1711874745467" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1408" width="32" height="32"><path d="M28.668 367.46H114.8v36H28.668z" fill="#4A4A4A" p-id="1409"></path><path d="M904.944 637.676c0 72.088-58.976 131.068-131.064 131.068H245.864c-72.088 0-131.068-58.976-131.068-131.068V186.984c0-72.088 58.98-131.068 131.068-131.068h528.02c72.084 0 131.064 58.98 131.064 131.068v450.692z" fill="#B9B9BF" p-id="1410"></path><path d="M773.884 786.744H245.864c-82.196 0-149.068-66.868-149.068-149.068V186.984c0-82.196 66.872-149.068 149.068-149.068h528.02c82.196 0 149.072 66.872 149.072 149.068v450.692c-0.012 82.2-66.876 149.068-149.072 149.068zM245.864 73.916c-62.344 0-113.068 50.724-113.068 113.068v450.692c0 62.344 50.724 113.068 113.068 113.068h528.02c62.344 0 113.072-50.724 113.072-113.068V186.984c0-62.344-50.728-113.068-113.072-113.068H245.864z" fill="#4A4A4A" p-id="1411"></path><path d="M337.612 292.892m-121.704 0a121.704 121.704 0 1 0 243.408 0 121.704 121.704 0 1 0-243.408 0Z" fill="#94E5FF" p-id="1412"></path><path d="M337.612 432.596c-77.032 0-139.704-62.672-139.704-139.708 0-77.032 62.672-139.704 139.704-139.704 77.036 0 139.708 62.672 139.708 139.704 0 77.036-62.672 139.708-139.708 139.708z m0-243.412c-57.184 0-103.704 46.52-103.704 103.704s46.52 103.708 103.704 103.708c57.184 0 103.708-46.524 103.708-103.708S394.796 189.184 337.612 189.184z" fill="#4A4A4A" p-id="1413"></path><path d="M683.548 292.892m-121.704 0a121.704 121.704 0 1 0 243.408 0 121.704 121.704 0 1 0-243.408 0Z" fill="#94E5FF" p-id="1414"></path><path d="M683.548 432.596c-77.036 0-139.708-62.672-139.708-139.708 0-77.032 62.672-139.704 139.708-139.704 77.032 0 139.704 62.672 139.704 139.704 0 77.036-62.672 139.708-139.704 139.708z m0-243.412c-57.188 0-103.708 46.52-103.708 103.704s46.52 103.708 103.708 103.708c57.18 0 103.704-46.524 103.704-103.708s-46.524-103.704-103.704-103.704zM901.204 367.46h86.128v36h-86.128z" fill="#4A4A4A" p-id="1415"></path><path d="M396.168 986.668v-217.924h220.94v217.924" fill="#8A8A8A" p-id="1416"></path><path d="M337.612 546.484h345.936v104.856H337.612z" fill="#8A8A8A" p-id="1417"></path><path d="M683.548 669.34H337.612a18 18 0 0 1-18-18v-104.856c0-9.936 8.06-18 18-18h345.936c9.936 0 18 8.064 18 18v104.856c0 9.94-8.064 18-18 18z m-327.936-36h309.936v-68.856H355.612v68.856z" fill="#4A4A4A" p-id="1418"></path><path d="M575.408 669.34a18.004 18.004 0 0 1-18-18v-104.856a18.004 18.004 0 0 1 36 0v104.856a18 18 0 0 1-18 18zM448.084 669.34a18 18 0 0 1-18-18v-104.856a18.004 18.004 0 0 1 36 0v104.856a18 18 0 0 1-18 18zM396.168 822.928h220.94v36H396.168zM396.168 895.512h220.94v36H396.168z" fill="#4A4A4A" p-id="1419"></path><path d="M338 298m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z" fill="#4A4A4A" p-id="1420"></path><path d="M683.548 298m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z" fill="#4A4A4A" p-id="1421"></path></svg></symbol>`);

    const topBarElement = this.addTopBar({
      icon: "iconFace",
      title: this.i18n.addTopBarIcon,
      position: "right",
      callback: async () => {
        //寻找当前编辑的文档的id
        let parentId = formatUtil.getDocid();
        if (parentId == null) {
          showMessage("error");
          return;
        }

        confirm(
          "⚠️操作前强烈建议先对数据进行备份，若转换效果不理想可从历史页面恢复。",
          "确认格式化吗？",
          async () => {
            let childrenResult = await fetchSyncPost(
              "/api/block/getChildBlocks",
              {
                id: parentId,
              }
            );
            let childrenBlocks = childrenResult.data;

            for (let i = 0; i < childrenBlocks.length; i++) {
              if (i === 0 || i % 50 === 0) {
                showMessage(
                  `正在格式化第${i + 1}至第${
                    i + 50
                  }个内容块，请勿进行其它操作。`
                );
              }
              let type = childrenBlocks[i].type;
              let id = childrenBlocks[i].id;
              if (type != "p" && type != "b" && type != "l" && type != "h") {
                continue;
              }
              let response = await fetchSyncPost(
                "/api/block/getBlockKramdown",
                {
                  id: id,
                }
              );
              let result = response.data;

              if (/^\{:.*\}$/.test(result.kramdown)) {
                const deleteEmptyClock = true;
                if (deleteEmptyClock) {
                  await fetchSyncPost("/api/block/deleteBlock", {
                    id: id,
                  });
                }
                continue;
              }
              //主要是备注更新有 bug
              if (/\^[（(].*[）)]\^/.test(result.kramdown)) {
                continue;
              }
              let formatResult = formatUtil.formatContent(result.kramdown);
              let updateResult = await fetchSyncPost("/api/block/updateBlock", {
                dataType: "markdown",
                data: formatResult,
                id: id,
              });
            }

            showMessage(`格式化完成！`);
          },
          () => {
            return;
          }
        );
      },
    });
  }

  onLayoutReady() {
    this.loadData(STORAGE_NAME);
    console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
  }

  onunload() {
    console.log(this.i18n.byePlugin);
  }
}
