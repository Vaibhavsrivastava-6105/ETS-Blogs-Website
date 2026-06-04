fetch('http://localhost:3000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'React' })
}).then(res => res.json()).then(console.log).catch(console.error);
