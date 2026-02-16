import mongoose from 'mongoose';

const markSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be less than 0'],
    max: [100, 'Score cannot exceed 100']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate marks for same student-course
markSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Mark || mongoose.model('Mark', markSchema);
