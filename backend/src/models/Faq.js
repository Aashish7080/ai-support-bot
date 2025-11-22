import mongoose from 'mongoose';

const FaqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tags: [String] // Helps with keyword filtering if needed
});

export default mongoose.model('Faq', FaqSchema);