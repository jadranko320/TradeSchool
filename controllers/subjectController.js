const Subject = require('./../models/subjectModel');
const factory = require('./handlerFactory');

exports.getAllSubjects = factory.getAll(Subject);
exports.getSubject = factory.getOne(Subject);
exports.createSubject = factory.createOne(Subject);
exports.updateSubject = factory.updateOne(Subject);
exports.deleteSubject = factory.deleteOne(Subject);
