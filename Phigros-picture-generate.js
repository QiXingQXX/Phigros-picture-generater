import puppeteer from '../../lib/puppeteer/puppeteer.js';

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

export class phigros extends plugin{
    constructor() {
        super({
            name: 'Phigros-picture-generate',
            dsc: 'phigros-b19-img',
            event: 'message',
            priority: 5000,
            rule: [
                {
                    reg: '/pp bind ',
                    fnc: 'bind'
                },
                {
                    reg: '/pp b19',
                    fnc: 'b19'
                },
            ]
        })
    }

    async bind (e) {
        let sessiontoken = e.msg.replaceAll('/pp bind ', '')
        if (sessiontoken.length == 25) {
            logger.mark(sessiontoken)
            const userid = e.user_id
            logger.mark(userid)
            logger.info("phigros-others-stoken-" + userid)
            //写入SessionToken数据文件
            redis.set("phigros-others-stoken-" + userid, sessiontoken + "");
            e.reply('绑定成功！')      
        }else{
            e.reply("token长度错误: " + sessiontoken.length)
        }
    }

    async b19 (e) {
        const userid = e.user_id
        //Node.js的uncaughtException事件处理程序
        process.on("uncaughtException", function (err) {
            logger.erro(err)
        })
        logger.mark(e.nickname)
        //检测是否绑定SessionToken，如未绑定，提示绑定
        //logger.info("phigros-others-stoken-" + userid)
        const sessiontoken = await redis.get("phigros-others-stoken-" + userid);
        //logger.info(sessiontoken)

        // 使用 puppeteer 库初始化浏览器
        const browser = await puppeteer.browserInit();
        // 打开一个新页面
        const page = await browser.newPage();
        // 设置页面大小
        await page.goto('http://127.0.0.1:9091/?name=' + encodeURIComponent(e.nickname) + '#' + sessiontoken);
        // 导航到特定 URL
        
        setTimeout(async () => {
            await page.setViewport({ width: 1030, height: 3670 });
            const buff = await page.screenshot({
                clip: {
                    x: 0, y: 0, width: 1030, height: 2670
                }//x: 300, y: 1423, width: 675, height: 1800
            });
            // 关闭页面
            await page.close();
            // 回复图像数据
            await e.reply(segment.image(buff));            
        }, 2000);
        // 返回 true
        return
    }
}
