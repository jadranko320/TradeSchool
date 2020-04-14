const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

// funkcja usuwa element z DB / Model to: User, Tour, Review etc. / req.params.id - id pobierane z URL
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('Nie znaleziono dokumentu z takim ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

// fn aktualizuje dane w DB
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      // req.params.id - czyli co aktualizujemy / req.body - czym aktualizujemy (input data)
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('Nie znaleziono dokumentu z takim ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// tworzy nowy dokument w DB
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// pobiera jeden dokument z DB / popOptions - opcje metody populate np. { path: 'reviews' } - populate imituje embedding, wyświetlając 'połączenie dwóch kolekcji w jednej', na podstawie referencji 'reviews'
// id przechowywane w tablicy reviews zostaną zastąpione prawdziwymi opiniami / referencja 'reviews' odnosi się do zmiennej wirtualnej reviews
// wyświetla wynik w wirtualnej zmiennej, stworzonej w tourModel
exports.getOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('Nie znaleziono dokumentu z takim ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// pobiera wszystkie wyniki z DB
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
