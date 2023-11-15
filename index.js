"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const request_1 = __importDefault(require("request"));
// Rest of your code remains the same
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
let topStories = 'https://hacker-news.firebaseio.com/v0/topstories.json';
let CONFIG = {
    "webhook_url": "",
    "channel": "#general",
    "bot_username": "HackerNewsBot",
    "bot_icon_emoji": ":newspaper:",
    "post_color": "#FF6600",
    "fallback": "Newsbot: Your automated news aggregator."
};
app.get('/', (req, res) => {
    selectAndPost().then(data => {
        res.json(data);
    }).catch(err => {
        res.status(500).send(err.message);
    });
});
app.post('/', (req, res) => {
    selectAndPost();
    res.send(`Post Hello World!`);
});
function selectAndPost() {
    return new Promise((resolve, reject) => {
        (0, request_1.default)({ url: topStories }, (err, httpResponse, body) => {
            if (err) {
                console.error("Newsbot failed to fetch " + topStories + "!");
                reject(err);
            }
            else {
                body = JSON.parse(body);
                let promises = [];
                for (let index = 0; index < 10; index++) {
                    let linkID = body[index];
                    let url = "https://hacker-news.firebaseio.com/v0/item/" + linkID + ".json";
                    promises.push(new Promise((resolve, reject) => {
                        (0, request_1.default)(url, (err, httpResponse, body) => {
                            if (err) {
                                console.error("Hacker News Scraper failed to fetch " + url + "!");
                                reject(err);
                            }
                            else {
                                body = JSON.parse(body);
                                resolve({
                                    title: body.title,
                                    url: body.url,
                                    score: body.score,
                                    author: body.by,
                                    time: body.time,
                                });
                            }
                        });
                    }));
                }
                Promise.all(promises).then(results => {
                    resolve(results);
                }).catch(err => {
                    reject(err);
                });
            }
        });
    });
}
app.listen(port, () => {
    console.log(`Rest API started successfully on port ${port}`);
});
