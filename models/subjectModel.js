const mongoose = require('mongoose');
const slugify = require('slugify');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Wymagana jest nazwa przedmiotu'],
      unique: true,
      trim: true,
      minlength: [5, 'Nazwa przemiotu musi mieć co najmniej 5 znaków'],
      maxlength: [
        40,
        'Nazwa przedmiotu nie może przekraczać długości 40 znaków'
      ]
    },
    slug: String,
    numOfHours: {
      type: Number,
      required: [true, 'Konieczne jest podanie liczby godzin przedmiotu']
    },
    maxGroupSize: {
      type: Number,
      required: [
        true,
        'Należy podać maksymalną liczbę osób, uczęszczających na zajęcia'
      ]
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    description: {
      type: String,
      required: [true, 'Należy podać ogólny zarys programu nauczania'],
      trim: true
    },
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

subjectSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

subjectSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'teacher',
    select: 'name surname -_id'
  });
  next();
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
