const mongoose = require('mongoose');

// Adjust the URI if necessary
const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://memory5021:0506@cluster0.rpcg0oe.mongodb.net/?appName=Cluster0"; 

const DraftSchema = new mongoose.Schema({
  title: String,
  content: String,
  lastSaved: Date
}, { strict: false });

const Draft = mongoose.models.Draft || mongoose.model('Draft', DraftSchema);

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");
  
  const drafts = await Draft.find().sort({ lastSaved: -1 }).limit(5);
  console.log("Found drafts:", drafts.length);
  
  drafts.forEach(d => {
    console.log(`--- Draft: ${d.title} (ID: ${d._id}) ---`);
    console.log("Content length:", d.content ? d.content.length : 0);
    console.log("Content start:", d.content ? d.content.substring(0, 100) : "NO CONTENT");
    console.log("-----------------------------------------");
  });
  
  process.exit(0);
}

check().catch(console.error);
