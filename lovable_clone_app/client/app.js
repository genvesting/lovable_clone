const e = React.createElement;

function App() {
  return e('div', null, [
    e('h1', null, 'Welcome to Lovable Clone'),
    e('p', null, 'This is a minimal demo using React via CDN.'),
    e('p', null, 'Backend API call result will appear below:'),
    e('pre', { id: 'result' }, 'Loading...'),
  ]);
}

const root = document.getElementById('root');
ReactDOM.render(e(App), root);

fetch('/api/hello')
  .then(res => res.json())
  .then(data => {
    document.getElementById('result').textContent = JSON.stringify(data, null, 2);
  })
  .catch(err => {
    document.getElementById('result').textContent = 'Error fetching API';
  });
