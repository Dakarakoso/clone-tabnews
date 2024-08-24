const calculadora = require("../../models/calculadora");

test("testar 2 + 2 = 4", () => {
  const resultado = calculadora.somar(2, 2);
  expect(resultado).toBe(4);
});

test("testar 'banana' + 100 = error", () => {
  const resultado = calculadora.somar("banana", 100);
  expect(resultado).toBe("error");
});

test("testar 100 + banana = error", () => {
  const resultado = calculadora.somar(100, "banana");
  expect(resultado).toBe("error");
});

test("testar se o usuario usar function sem argumento para ser error", () => {
  const resultado = calculadora.somar();
  expect(resultado).toBe("error");
});
