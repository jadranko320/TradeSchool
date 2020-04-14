const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  // sytuacja, w której ID ma poprawny format, ale obiekt z takim ID nie istnieje, wysyłany jest wtedy błąd
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  // fn zgłasza błędy w razie duplikacji pól unikatowych np. nazwy
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; // stackoverflow - funkcja wyciąga nazwę ze stringa
  console.log(value);

  const message = `Duplikacja wartości pola: ${value}. Użyj innej wartości`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  // funkcja zgłaszająca błędy przy niepoprawnej walidacji np. podczas uaktualniania danych
  const errors = Object.values(err.errors).map(el => el.message); // dane są rozbite na klika obiektów / funkcja tworzy tablicę danych z błędami

  const message = `Wprowadzono niepoprawne dane. ${errors.join('. ')}`; // join('. ') zespala elementy tablicy w stringa oddzielając zdania '. '
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  // jak najwięcej informacji dla developera
  res.status(err.statusCode).json({
    status: err.status,
    error: err, // cały błąd, bez formatowania
    message: err.message,
    stack: err.stack // opis błędu "stack trace"
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client / jeśli to znany (zaprogramowany przez developera) błąd
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details / jeśli to nieznany (nieuwzględniony przez programistę) błąd
  } else {
    // 1) Log error
    console.error('ERROR', err); // log do konsoli, który potem może być zapisywany w logach na serwerze

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Coś poszło nie tak'
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
