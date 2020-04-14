const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

const signToken = id => {
  // tworzy token na bazie id użytkownika, kodu secret oraz czasu trwania tokenu
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

const createSendToken = (user, statusCode, res) => {
  // zwraca odpowiedź serwera na np. utworzenie użytkownika, update hasła itp.
  const token = signToken(user._id); // tworzy nowy token na podstawie id usera
  const cookieOptions = {
    // tworzy zmienną z opcjami cookie
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ), // cookie wygasa za x czasu od teraz
    httpOnly: true // przeglądarka nie może modyfikować cookie
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // jeśli jesteśmy w trybie prod to cookie są zabezpieczane przez protokół https

  res.cookie('jwt', token, cookieOptions); // wysyłamy cookie (nazwa, co wysyłamy, opcje)

  // Remove password from output
  user.password = undefined; // usuwamy ze zwracanego obiektu pole hasło

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.signup = catchAsync(async (req, res, next) => {
  // tworzy użytkownika
  const newUser = await User.create({
    name: req.body.name,
    surname: req.body.surname,
    pin: req.body.pin,
    dob: req.body.dob,
    email: req.body.email,
    number: req.body.number,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  createSendToken(newUser, 201, res);
});

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.login = catchAsync(async (req, res, next) => {
  // logowanie do serwisu
  const { email, password } = req.body; // pobiera wpisany email i hasło

  // 1) Check if email and password exist - sprawdza, czy użytkownik wpisał email i hasło w formularz
  if (!email || !password) {
    return next(new AppError('Proszę wpisać email oraz hasło', 400));
  }
  // 2) Check if user exists && password is correct - sprawdza poprawność wpisanych danych (emailu i hasła)
  const user = await User.findOne({ email }).select('+password'); // pole password nie jest wyświetlane w modelu, więc + symbolizuje dodanie tego pola do wyświetlanych, aby otrzymać dostęp do danych, przechowywanych w tym polu

  if (!user || !(await user.correctPassword(password, user.password))) {
    // jeśli taki użytkownik nie istnieje lub wpisane hasło !== zakodowaneego hasła, wysyła błąd
    return next(new AppError('Niepoprawny email lub hasło', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.protect = catchAsync(async (req, res, next) => {
  // funkcja autoryzująca dostęp do adresu URL (do zasobów) / token generowany podczas logowania musi być taki sam jak token w tej funkcji (funkcja porównuje tokeny i przydziela dostęp)
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        'Nie masz uprawnień do tej treści. Proszę się zalogować',
        401
      )
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // weryfikuje token (odkodowuje go, dzięki secret) / zmienna decoded to obiekt w kt. znajduje się m.in wartość id, iat itp.

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id); // wyszukuje użytkownika po id, pozyskanym z odkodowanego tokenu
  if (!currentUser) {
    // jeśli owy nie istnieje, zwraca błąd
    return next(
      new AppError('Użytkownik powiązany z tym tokenem już nie istnieje', 401)
    );
  }

  // 4) Check if user changed password after the token was issued - sprawdza, czy użytkownik nie zmienił hasła w czasie trwania tokenu
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    // decoded.iat - decoded to obiekt, iat to czas w jakim został wydany token (to data zamienione na liczbę w sek.)
    return next(
      new AppError('Użytkownik niedawno zmienił hasło. Spróbuj ponownie', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; // req.user (req.session.user) - obiekt, w którym przechowywane są informacje nt. aktualnie zalogowanego (w sesji) usera
  res.locals.user = currentUser; // res.locals.user - obiekt usera, który używamy w pug temp / properties that are valid only for the lifetime of the request
  next();
});

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Nie masz uprawnień do tego działania', 403));
    }

    next();
  };
};

exports.restrictToView = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(res.locals.user.role)) {
      return next(new AppError('Nie masz uprawnień do tego działania', 403));
    }
    next();
  };
};

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // fn 'zapomniałem hasła'
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email }); // zapisuje do zmiennej informacje o użytkowniku (wyszukuje użytkownika po emailu)
  if (!user) {
    // jeśli użytkownik nie istnieje zwraca błąd
    return next(
      new AppError('Użytkownik o takim adresie email nie istnieje', 404)
    );
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken(); // tworzy token na podstawie funkcji w userModel
  await user.save({ validateBeforeSave: false }); // zapisuje dane (zmodyfikowane lub utworzone w funkcji createPasswordResetToken) do bazy danych

  // 3) Send it to user's email - tworzy adres URL, na który użytkownik może wejść aby zresetować hasło / req.protocol (http / https) / req.get('host') - środowisko w postman
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/users/resetPassword/${resetToken}`;

  const message = `Zapomniałeś hasła? Skorzystaj z linku, aby je zresetować: ${resetURL}.\nJeśli nie zapomniałeś hasła, zignoruj ten email!`;

  try {
    await sendEmail({
      // fn wysyłająca email
      email: user.email, // odbiorca
      subject: 'Twój token resetujący hasło (aktywny przez 10 min.)', // temat wiadomości
      message // treść wiadomości
    });

    res.status(200).json({
      status: 'success',
      message: 'Token wysłany na podany email!'
    });
  } catch (err) {
    // w razie gdy przy wysyłaniu nastąpi błąd, usuwamy przed chwilą stworzone dane w bazie danych (token i czas na reset)
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false }); // zapisujemy zmiany w bazie danych po usunięciu

    return next(
      new AppError(
        'Nastąpił błąd podczas wysyłania emailu. Proszę spróbować ponownie.'
      ),
      500
    );
  }
});

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token) // req.params.token - parametr z adresu URL
    .digest('hex');

  const user = await User.findOne({
    // wuszukuje usera, który ma taki token i czas wygaśnięcia tokenu jest większy od obecnego
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token jest niepoprawny lub wygasł', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user - pre save middleware w userModel

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res); // tworzy nowy token, który przyznaje dostęp (loguje) do zasobów
});

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.updatePassword = catchAsync(async (req, res, next) => {
  // zmiena hasła
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct - jeśli NIE 'hasło w DB jest takie samo jak wpisane hasło (fn koduje wpisane hasło i je porównuje z tym w DB)' zwraca błąd
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Twoje obecne hasło jest niepoprawne', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
