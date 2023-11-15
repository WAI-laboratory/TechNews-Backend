import express from 'express';
import request from 'request';

// Rest of your code remains the same


const app = express();
const port = process.env.PORT || 8080;

let topStories = 'https://hacker-news.firebaseio.com/v0/topstories.json';

interface Config {
    webhook_url: string;
    channel: string;
    bot_username: string;
    bot_icon_emoji: string;
    post_color: string;
    fallback: string;
    retry?: boolean;
}

let CONFIG: Config = {
    "webhook_url": "",
    "channel": "#general",
    "bot_username": "HackerNewsBot",
    "bot_icon_emoji": ":newspaper:",
    "post_color": "#FF6600",
    "fallback": "Newsbot: Your automated news aggregator."
};

app.get('/', (req: Request, res: Response) => {
    selectAndPost().then(data => {
        res.json(data);
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

app.post('/', (req: Request, res: Response) => {
    selectAndPost();
    res.send(`Post Hello World!`);
});

function selectAndPost(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        request({ url: topStories }, (err, httpResponse, body) => {
            if (err) {
                console.error("Newsbot failed to fetch " + topStories + "!");
                reject(err);
            } else {
                body = JSON.parse(body);
                let promises: Promise<any>[] = [];
                for (let index = 0; index < 10; index++) {
                    let linkID = body[index];
                    let url = "https://hacker-news.firebaseio.com/v0/item/" + linkID + ".json";
                    promises.push(new Promise((resolve, reject) => {
                        request(url, (err, httpResponse, body) => {
                            if (err) {
                                console.error("Hacker News Scraper failed to fetch " + url + "!");
                                reject(err);
                            } else {
                                body = JSON.parse(body);
                                resolve({ title: body.title, url: body.url, score: body.score, author: body.by });
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
