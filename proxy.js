import * as http from 'node:http';
import { createProxyServer } from 'http-proxy-3';

const PORT = 5175;
const TARGET = 'http://localhost:5174';
const PREFIX = '/subpath';

function stripPrefix(url) {
    if (url === PREFIX) return '/';
    if (url.startsWith(PREFIX)) {
        return url.slice(PREFIX.length);
    }
    return null;
}

const proxy = createProxyServer({ target: TARGET });
proxy.on('error', (err, req, res) => {
    res.writeHead(502);
    res.end(`Bad gateway: ${err.message}`);
});

const server = http.createServer((req, res) => {
    const strippedUrl = stripPrefix(req.url);
    if (strippedUrl === null) {
        res.writeHead(404);
        res.end('Not found');
        return;
    }
    req.url = strippedUrl;
    proxy.web(req, res);
});

server.listen(PORT, () => {
    console.log(`Proxy listening on http://localhost:${PORT}${PREFIX}/ -> ${TARGET}/`);
});
