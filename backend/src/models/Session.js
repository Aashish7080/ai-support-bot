import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  history: [
    {
      role: { type: String, enum: ['user', 'assistant', 'system'] },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

export default mongoose.model('Session', SessionSchema);