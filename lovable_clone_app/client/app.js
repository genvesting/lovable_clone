const e = React.createElement;

function Post({ post, onLike, onComment }) {
  const [text, setText] = React.useState('');

  const submitComment = () => {
    if (!text.trim()) return;
    onComment(post.id, text);
    setText('');
  };

  return e('div', { className: 'post' }, [
    e('p', { key: 'content' }, post.content),
    e('span', { key: 'likes', style: { marginRight: '8px' } }, `Likes: ${post.likes}`),
    e('button', { key: 'likeBtn', onClick: () => onLike(post.id) }, 'Like'),
    e('div', { key: 'comments' },
      post.comments.map(c => e('p', { key: c.id, className: 'comment' }, c.content))
    ),
    e('div', { key: 'addComment' }, [
      e('input', {
        key: 'commentInput',
        type: 'text',
        value: text,
        onChange: ev => setText(ev.target.value),
        placeholder: 'Write a comment...'
      }),
      e('button', { key: 'commentBtn', onClick: submitComment }, 'Comment')
    ])
  ]);
}

function App() {
  const [posts, setPosts] = React.useState([]);
  const [content, setContent] = React.useState('');

  React.useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  const addPost = () => {
    if (!content.trim()) return;
    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
      .then(res => res.json())
      .then(p => {
        setPosts([...posts, p]);
        setContent('');
      });
  };

  const likePost = id => {
    fetch(`/api/posts/${id}/like`, { method: 'POST' })
      .then(res => res.json())
      .then(updated => {
        setPosts(posts.map(p => (p.id === id ? updated : p)));
      });
  };

  const commentPost = (id, text) => {
    fetch(`/api/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text })
    })
      .then(res => res.json())
      .then(updated => {
        setPosts(posts.map(p => (p.id === id ? updated : p)));
      });
  };

  return e('div', null, [
    e('h1', null, 'Welcome to Lovable Clone'),
    e('div', { className: 'new-post' }, [
      e('input', {
        key: 'input',
        type: 'text',
        value: content,
        onChange: ev => setContent(ev.target.value),
        placeholder: 'Write something...'
      }),
      e('button', { key: 'postBtn', onClick: addPost }, 'Post')
    ]),
    e('div', { id: 'posts' }, posts.map(p => e(Post, { post: p, onLike: likePost, onComment: commentPost, key: p.id })))
  ]);
}

const root = document.getElementById('root');
ReactDOM.render(e(App), root);
