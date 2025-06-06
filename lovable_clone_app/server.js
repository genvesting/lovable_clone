const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// In-memory posts storage
let posts = [];

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res) {
  let reqPath = url.parse(req.url).pathname;
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, 'client', reqPath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    const type = ext === '.js' ? 'application/javascript' : 'text/html';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

function readBody(req, callback) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      callback(null, data);
    } catch (e) {
      callback(e);
    }
  });
}

function handleApi(req, res) {
  const parsed = url.parse(req.url, true);
  const parts = parsed.pathname.split('/').filter(Boolean);

  if (req.method === 'GET' && parsed.pathname === '/api/posts') {
    return sendJSON(res, 200, posts);
  }

  if (req.method === 'POST' && parsed.pathname === '/api/posts') {
    return readBody(req, (err, data) => {
      if (err || !data.content) {
        return sendJSON(res, 400, { error: 'Content is required' });
      }
      const newPost = {
        id: Date.now().toString(),
        content: data.content,
        likes: 0,
        comments: [],
      };
      posts.push(newPost);
      sendJSON(res, 201, newPost);
    });
  }

  if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'posts' && parts[3] === 'like' && req.method === 'POST') {
    const id = parts[2];
    const post = posts.find(p => p.id === id);
    if (!post) return sendJSON(res, 404, { error: 'Post not found' });
    post.likes += 1;
    return sendJSON(res, 200, post);
  }

  if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'posts' && parts[3] === 'comments' && req.method === 'POST') {
    const id = parts[2];
    const post = posts.find(p => p.id === id);
    if (!post) return sendJSON(res, 404, { error: 'Post not found' });
    return readBody(req, (err, data) => {
      if (err || !data.content) {
        return sendJSON(res, 400, { error: 'Content is required' });
      }
      const comment = { id: Date.now().toString(), content: data.content };
      post.comments.push(comment);
      sendJSON(res, 201, post);
    });
  }

  res.writeHead(404);
  res.end('Not found');
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    handleApi(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
