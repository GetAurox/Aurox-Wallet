import { Matrix } from "./matrix";

const generateNumberTable = (rows: number, columns: number) => {
  const result: number[][] = [];

  const elements = [...Array(rows * columns + 1).keys()];

  elements.shift();

  for (let i = 0; i < rows; i++) {
    result[i] = elements.slice(columns * i, columns * (i + 1));
  }

  return result;
};

describe("Matrix creation", () => {
  it("Can create a simple matrix", () => {
    const numberTable = generateNumberTable(3, 3);

    const matrix = new Matrix(numberTable);

    expect(matrix.toArray()).toEqual(numberTable);
  });

  it("Can create an emtpy matrix", () => {
    const matrix = new Matrix([]);

    expect(matrix.toArray()).toEqual([]);
  });

  it("Can not create a matrix with different row sizes", () => {
    const initializer = () => new Matrix([[1], [1, 2]]);

    expect(initializer).toThrow("Can not create matrix with different row sizes");
  });
});

describe("Matrix operations", () => {
  const numberTable = generateNumberTable(3, 3);

  it("Test matrix transposition", () => {
    const result = new Matrix(numberTable).transpose().toArray();

    expect(result).toEqual([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);
  });

  it("Tests matrix apply method", () => {
    const result = new Matrix(numberTable).apply(value => ++value).toArray();

    expect(result[0]).toEqual([2, 3, 4]);
    expect(result[1]).toEqual([5, 6, 7]);
    expect(result[2]).toEqual([8, 9, 10]);
  });

  it("Verifies that the new row can be added to the matrix", () => {
    const matrix = new Matrix(numberTable);

    expect(matrix.shape.rows).toEqual(3);

    matrix.add([1, 1, 1]);

    expect(matrix.shape.rows).toEqual(4);
  });

  it("Verifies that the new row can be added to an empty matrix", () => {
    const matrix = new Matrix([]);

    matrix.add([1, 1, 1]);

    expect(matrix.toArray()).toEqual([[1, 1, 1]]);
  });

  it("Verifies that the row can be removed from the matrix", () => {
    const matrix = new Matrix(numberTable);

    expect(matrix.shape.rows).toEqual(3);

    matrix.remove(0);

    expect(matrix.shape.rows).toEqual(2);
  });

  it("Verifies that the two matrices can be joined", () => {
    const firstMatrix = new Matrix(generateNumberTable(1, 3));
    const otherMatrix = new Matrix(generateNumberTable(1, 3));

    firstMatrix.join(otherMatrix);

    expect(firstMatrix.toArray()).toEqual([
      [1, 2, 3],
      [1, 2, 3],
    ]);
  });

  it("Verifies that the new matrix can be joined to an empty matrix", () => {
    const firstMatrix = new Matrix([]);

    const otherMatrix = new Matrix(generateNumberTable(1, 3));

    firstMatrix.join(otherMatrix);

    expect(firstMatrix.toArray()).toEqual([[1, 2, 3]]);
  });
});
