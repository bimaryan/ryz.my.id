fetch('http://localhost:5009/api/whatsapp/contacts/usr_abc123')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
