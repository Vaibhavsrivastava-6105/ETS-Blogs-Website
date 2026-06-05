// Using Node native fetch
// Using Node 18+ native fetch
async function testUpload() {
  console.log("Starting Cloudinary connection test...");
  
  // A tiny 1x1 pixel red GIF in base64
  const tinyImageBase64 = "data:image/gif;base64,R0lGODlhAQABAIAAAP8AAf///yH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

  try {
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: tinyImageBase64 })
    });
    
    const data = await response.json();
    
    if (data.success && data.url.includes('cloudinary.com')) {
      console.log("✅ SUCCESS! Image uploaded to Cloudinary.");
      console.log("🌐 Secure URL:", data.url);
      console.log("🔑 Public ID:", data.public_id);
    } else {
      console.error("❌ FAILED! Cloudinary upload did not return success.");
      console.error("Response:", data);
    }
  } catch (error) {
    console.error("❌ ERROR hitting API:", error.message);
  }
}

testUpload();
