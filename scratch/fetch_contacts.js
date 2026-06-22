fetch('http://localhost:5000/api/whatsapp/contacts/usr_abc123')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
