// codigo-barras.service.ts

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CodigoBarrasService {
  calcularCodigoBarras(codigo: string, peso: number, precio: number): string {
    const multi = peso * precio;
    const parteEnteramulti = Math.trunc(multi);
    const redondeado = Math.ceil(multi * 1000);
    const redondeado2 = Math.ceil(multi * 100);
    const dosD = String(redondeado).substring(0, 2);
    const tresD = String(redondeado).substring(0, 3);
    const cuatroD = String(redondeado).substring(0, 4);
    const numeroStr = multi.toString();
    const partes = numeroStr.split(".");
    const parteEntera = partes[0];
    const parteDecimal = partes[1] || "";

    let nuevoprimerDecimal = 0;
    let nuevoSegundoDecimal = 0;

    console.log('peso: ' + peso, precio)
    console.log('multi :' + multi)
    console.log(parteDecimal);

    if (parteDecimal.length >= 3) {
      const tercerDecimal = parseInt(parteDecimal[2], 10);
      const segundoDecimal = parseInt(parteDecimal[1], 10);
      const primerDecimal = parseInt(parteDecimal[0], 10);

      if (tercerDecimal >= 5) {

        const nuevoSegundoDecimal = (segundoDecimal + 1) % 10;
        const nuevoprimerDecimal =
          primerDecimal + (segundoDecimal + 1 >= 10 ? 1 : 0);

        if (parteEnteramulti < 10) {
          let resultado = `26${codigo}000${parteEntera}${nuevoprimerDecimal}${nuevoSegundoDecimal}`;

          const codigoConUltimoDigito = calcularUltimoDigito(resultado);
          return `26${codigo}000${parteEntera}${nuevoprimerDecimal}${nuevoSegundoDecimal}${codigoConUltimoDigito}`;
        } else {
          let resultado = `26${codigo}00${tresD}${nuevoSegundoDecimal}`;
          const codigoConUltimoDigito = calcularUltimoDigito(resultado);
          return `26${codigo}00${tresD}${nuevoSegundoDecimal}${codigoConUltimoDigito}`;
        }
      } else {
        nuevoSegundoDecimal = segundoDecimal;
        nuevoprimerDecimal = primerDecimal;
        console.log('2do2', segundoDecimal)
        console.log('1er', primerDecimal)

        if (parteEnteramulti < 10) {
          let resultado = `26${codigo}000${parteEntera}${primerDecimal}${segundoDecimal}`;
          const codigoConUltimoDigito = calcularUltimoDigito(resultado);
          return `26${codigo}000${parteEntera}${primerDecimal}${segundoDecimal}${codigoConUltimoDigito}`;
        } else if (parteEnteramulti >= 10) {
          let resultado = `26${codigo}00${tresD}${segundoDecimal}`;
          const codigoConUltimoDigito = calcularUltimoDigito(resultado);
          return `26${codigo}00${tresD}${segundoDecimal}${codigoConUltimoDigito}`;
        }
      }
    }
    const codigoConUltimoDigito = calcularUltimoDigito(
      `26${codigo}000${tresD}${nuevoSegundoDecimal}`
    );
    return `26${codigo}000${tresD}${codigoConUltimoDigito}`;
    console.log("tresD"+tresD)
  }
}

function calcularUltimoDigito(codigoBarras: string): number { 
  // Verificar que el código de barras tenga 12 caracteres
  // if (codigoBarras.length !== 12) {
  //   console.log(codigoBarras)
  //   throw new Error("El código de barras debe tener 12 caracteres.");
  // }
  console.log(codigoBarras)
  // Convertir el código de barras en un arreglo de números
  const numeros = codigoBarras.split("").map((char) => parseInt(char, 10));

  // Sumar todos los dígitos en las posiciones pares (0-indexed)
  let sumaPares = 0;
  for (let i = 0; i < numeros.length; i++) {
    if (i % 2 === 0) {
      sumaPares += numeros[i];
    }
  }

  // Sumar todos los dígitos en las posiciones impares (0-indexed)
  let sumaImpares = 0;
  for (let i = 0; i < numeros.length; i++) {
    if (i % 2 === 1) {
      sumaImpares += numeros[i];
    }
  }

  // Multiplicar por 3 el valor obtenido en la suma de los dígitos impares
  const multiplicadoPorTres = sumaImpares * 3;
  // Sumar este valor más la suma de los pares
  const sumaTotal = multiplicadoPorTres + sumaPares;
  // Redondear el valor obtenido a la decena inmediatamente superior
  const redondeado = Math.ceil(sumaTotal / 10) * 10;
  // Calcular el dígito de control restando la suma total del redondeo
  const digitoControl = redondeado - sumaTotal;

  return digitoControl;
}
