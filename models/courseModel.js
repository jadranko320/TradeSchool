const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Wymagana jest nazwa kursu'],
      unique: true,
      trim: true,
      minlength: [5, 'Nazwa kursu musi mieć co najmniej 5 znaków'],
      maxlength: [40, 'Nazwa kursu nie może przekraczać długości 40 znaków']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Należy podać ogólny zarys programu nauczania'],
      trim: true
    },
    subjects: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Subject'
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

courseSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

courseSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'subjects',
    select: 'name'
  });
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
