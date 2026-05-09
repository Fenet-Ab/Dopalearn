const jwt = require('jsonwebtoken');
require('dotenv').config();
const token = jwt.sign({ sub: 'ca990ed0-1ea1-4897-a80d-f3af5d736400', role: 'admin' }, process.env.JWT_SECRET || 'super-secret-key');

async function test() {
  const formData = new FormData();
  formData.append('title', 'Test title');
  formData.append('description', '');
  // I will use the category id I queried earlier: 3037af94-ba08-4222-a2f3-c92a1d240154
  formData.append('categoryId', '3037af94-ba08-4222-a2f3-c92a1d240154'); 
  
  const blob = new Blob(['dummy content'], { type: 'video/mp4' });
  formData.append('video', blob, 'test.mp4');
  formData.append('isDraft', 'true');

  try {
    const res = await fetch('http://localhost:5000/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('DATA:', data);
  } catch (err) {
    console.error(err);
  }
}
test();
