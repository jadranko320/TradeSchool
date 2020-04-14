class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; // hard copy
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]); // usuwa powyższe pola z obiektu

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj); // zamienia obiekt na tekst
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // zamienia np. gte na $gte / /g - wszystkie, a nie tylko 1 napotkany / \b - tylko te określone słowa (nie zalicza się do nich np. gtexd)

    this.query = this.query.find(JSON.parse(queryStr)); // szuka wyników / JSON.parse() - zamienia stringa na obiekt

    return this; // konieczne jest zwracanie, żeby program zakończył działanie
  }

  sort() {
    if (this.queryString.sort) {
      // jeśli w obiekcie req.query znajduje się sort
      const sortBy = this.queryString.sort.split(',').join(' '); // modyfikuje dane wejściowe tour?sort=price,duration -> "price,duration" -> "price duration"
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // defaultowo sortuje malejąco
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); // select wyświetla tylko określone pole np tylko price i duration
    } else {
      this.query = this.query.select('-__v'); // usuwa pole -__v
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // zamiana stringa na liczbę, defaultowo 1
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; // 2 strona to wyniki od 101 do 200 / skipuje o 100, żeby wyświetlić od 101

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
