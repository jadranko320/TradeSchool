const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

// do fn updateMe
const filterObj = (obj, ...allowedFields) => {
  // filtracja obiektu - 1 arg jest obiekt z danymi, 2 arg to tablica ze stringami
  const newObj = {}; // tworzy nowy, pusty obiekt
  Object.keys(obj).forEach(el => {
    // Object.keys(obj) - pobiera klucze (pole) znajdujące się w obiekcie i zapisuje je do tablicy / przechodzi prze każdy element tablicy
    if (allowedFields.includes(el)) newObj[el] = obj[el]; // jeśli element tablicy z kluczami = elementowi tablicy z zezwolonymi kluczami (stringami) (w tablicy obiektu z kluczami zawiera się klucz z tablicy zezwolonych)
    // przypisuje do nowego obiektu pole z tablicy dozwolonych pól
  });
  return newObj; // zwraca nowy (uproszczony / nie zawierający niektórych pól) obiekt
};

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

// mw, które jako zmienną w URL bierze id aktualnie zalogowanego usera
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.updateMe = catchAsync(async (req, res, next) => {
  // update danych usera
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    // jeśli podamy pola: hasło i jego potwierdzenie, zwróci błąd, ponieważ do resetowania hasła jest inna funkcja, inny adres URL
    return next(
      new AppError(
        'Ta ścieżka jest przenaczona do aktualizacji danych osobowych. Jeśli chcesz zmienić hasło użyj /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'email'); // normalnie program kazałby wpisać wszystkie dane, łącznie z rolą (np. admin) / funkcja filtruje podane dane, aby program nie wymagał pewnych danych
  // w zasadzie wymaga tylko name i email

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // zwraca nowo powstały obiekt
    runValidators: true // używa walidacji ze schematu np. czy email ma prawidłowy format
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.deleteMe = catchAsync(async (req, res, next) => {
  // usuwa użytkownika (a właściwie zmieniamy jego status na nieaktywny, bo w DB zostają jego dane)
  await User.findByIdAndUpdate(req.user.id, { active: false }); // wyszukujemy usera po id i ustawiamy jego status na dezaktywowany (active: false)

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Ta ścieżka jest niezdefiniowana. Użyj /signup'
  });
};

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
