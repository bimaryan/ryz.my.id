async function test() {
  const form = new FormData();
  form.append('session_id', 'invalid-session');
  form.append('user_id', 'invalid-user');
  form.append('recipient', '123');
  form.append('message_type', 'text');
  form.append('message_content', 'hello');

  try {
    const res = await fetch('http://localhost:5000/api/whatsapp/send-message', {
      method: 'POST',
      body: form
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch(e) {
    console.error("Fetch Error:", e.message);
  }
}

test();
