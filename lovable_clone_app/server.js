const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory posts storage
let posts = [];

app.use(cors());
app.use(express.json());

// Serve static files from client
app.use(express.static(path.join(__dirname, 'client')));

// Get all posts
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// Create a new post
app.post('/api/posts', (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  const newPost = {
    id: Date.now().toString(),
    content,
    likes: 0,
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Like a post
app.post('/api/posts/:id/like', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  post.likes += 1;
  res.json(post);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
