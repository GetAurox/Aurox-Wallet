import clone from "lodash/clone";

/** In case you need to use linear algebra for any reason,
 * use official modules that are tested and have way better functionality */
export class Matrix<T> {
  #matrix: T[][] = [];

  constructor(values: T[][]) {
    const rowSizes = values.map(row => row.length);

    const areRowSizesEqual = rowSizes.every(rowLength => rowLength === values[0].length);

    if (!areRowSizesEqual) {
      throw new Error("Can not create matrix with different row sizes");
    }

    this.#matrix = clone(values);

    return this;
  }

  /** Indicates if the matrix is empty */
  get empty() {
    return this.shape.rows === 0;
  }

  /** Returns number of rows and columns */
  get shape() {
    const rows = this.#matrix.length;

    if (rows === 0) {
      return { rows, columns: 0 };
    }

    const columns = this.#matrix[0].length;

    return { rows, columns };
  }

  /** Transposes this matrix */
  transpose() {
    if (this.#matrix.length !== 0) {
      this.#matrix = this.#matrix[0].map((_, index) => this.#matrix.map(row => row[index]));
    }

    return this;
  }

  /** Applies transform function on all matrix elements and returns a new matrix */
  apply<Y>(transform: (value: T) => Y): Matrix<Y> {
    if (this.#matrix.length === 0) {
      return new Matrix<Y>([]);
    }

    return new Matrix(this.#matrix.map(row => row.map(element => transform(element))));
  }

  add(row: T[]) {
    if (row.length !== this.shape.columns && !this.empty) {
      throw new Error("Can not add a row with different number of columns");
    }

    this.#matrix.push(row);

    return this;
  }

  /** Remove a row on a particular index, if index is not provided it will remove the last one */
  remove(rowIndex?: number) {
    if (!rowIndex) {
      rowIndex = this.#matrix.length - 1;
    }

    if (rowIndex >= this.#matrix.length) {
      throw new Error(`There is no row on ${rowIndex} index inside the matrix`);
    }

    this.#matrix.splice(rowIndex, 1);

    return this;
  }

  slice(rowIndex: number) {
    this.#matrix = this.#matrix.slice(rowIndex);

    return this;
  }

  join(other: this) {
    if (this.shape.columns !== other.shape.columns && !this.empty) {
      throw new Error("Can not join matrices with a different number of columns");
    }

    this.#matrix.push(...other.toArray());

    return this;
  }

  /** Converts this matrix to a matching 2D array representation */
  toArray() {
    return this.#matrix;
  }
}
