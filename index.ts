import express from 'express';
import request from 'request';

// Rest of your code remains the same


const app = express();
const port = process.env.PORT || 8080;

let topStories = 'https://hacker-news.firebaseio.com/v0/topstories.json';

app.get('/hackernews', (req: express.Request, res: express.Response) => {
    selectAndPost().then(data => {
        res.json(data);
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

app.post('/hackernews', (req: express.Request, res: express.Response) => {
    selectAndPost().then(data => {
        res.json(data);
    }).catch(err => {
        res.status(500).send(err.message);
    });
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
                for (let index = 0; index < body.length; index++) {
                    let linkID = body[index];
                    let url = "https://hacker-news.firebaseio.com/v0/item/" + linkID + ".json";
                    promises.push(new Promise((resolve, reject) => {
                        request(url, (err, httpResponse, body) => {
                            if (err) {
                                console.error("Hacker News Scraper failed to fetch " + url + "!");
                                reject(err);
                            } else {
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
