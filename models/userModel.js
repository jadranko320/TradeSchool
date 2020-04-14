const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Podaj imię']
  },
  surname: {
    type: String,
    required: [true, 'Podaj nazwisko']
  },
  pin: {
    // personal identity number
    type: String,
    required: [true, 'Podaj numer PESEL'],
    validate: {
      validator: function(el) {
        return el.length === 11;
      },
      message: 'Podany numer PESEL ma niepoprawny format'
    }
  },
  dob: {
    // date of birth
    type: Date,
    required: [true, 'Podaj datę urodzenia']
  },
  email: {
    type: String,
    required: [true, 'Podaj email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Podany email ma niepoprawny format']
  },
  number: {
    type: String,
    required: [true, 'Podaj numer telefonu'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(el) {
        return el.length === 9;
      },
      message: 'Taki numer telefonu nie istnieje'
    }
  },
  photo: String,
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  password: {
    type: String,
    required: [true, 'Podaj hasło do konta'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Powtórz hasło'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Podane hasła różnią się od siebie'
    }
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course'
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'course',
    select: 'name'
  });
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
