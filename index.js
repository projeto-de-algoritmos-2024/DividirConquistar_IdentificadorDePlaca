const fs = require("fs");

// Função para calcular a multiplicação usando o algoritmo de Karatsuba
function karatsuba(x, y) {
  const xStr = x.toString();
  const yStr = y.toString();

  if (xStr.length === 1 || yStr.length === 1) {
    return BigInt(x) * BigInt(y);
  }

  const n = Math.max(xStr.length, yStr.length);
  const m = Math.floor(n / 2);

  const high1 = BigInt(xStr.slice(0, -m) || "0");
  const low1 = BigInt(xStr.slice(-m));
  const high2 = BigInt(yStr.slice(0, -m) || "0");
  const low2 = BigInt(yStr.slice(-m));

  const z0 = karatsuba(low1, low2);
  const z1 = karatsuba(low1 + high1, low2 + high2);
  const z2 = karatsuba(high1, high2);

  return z2 * BigInt(10 ** (2 * m)) + (z1 - z2 - z0) * BigInt(10 ** m) + z0;
}

// Função para converter a placa para um número grande
function convertPlateToNumber(plate) {
  return plate
    .split("")
    .map((char) => {
      if (/[A-Z]/.test(char)) {
        return char.charCodeAt(0) - 55; // A -> 10, B -> 11, ..., Z -> 35
      } else if (/[0-9]/.test(char)) {
        return char; // Números permanecem os mesmos
      } else {
        return ""; // Ignora caracteres inválidos
      }
    })
    .join("");
}

// Validação de placa (somente letras, números e tamanho entre 6 e 8 caracteres)
function isValidPlate(plate) {
  return /^[A-Z0-9\-]+$/.test(plate) && plate.length >= 6 && plate.length <= 8;
}

// Função para gerar o identificador único
function generateVehicleId(plate) {
  const timestamp = Math.floor(Date.now() / 1000); // Timestamp atual em segundos
  const plateNumber = BigInt(convertPlateToNumber(plate));
  const vehicleId = karatsuba(plateNumber, BigInt(timestamp));
  return { plate, timestamp, vehicleId };
}

// Lista de placas para teste
const plates = [
  "ABC1234",
  "XYZ9876",
  "BRA0A23",
  "CAR123A",
  "JKL4567",
  "TAX1234",
  "POL9876",
  "CAM1234",
  "MOT0001",
  "ABC-1234",
  "123-XYZ",
  "4567-AB",
  "TX-78654",
  "CA-X123YZ",
  "GB12ABC",
  "D-AB123",
  "F-456-XYZ",
  "NL-123-AB",
  "12-34",
  "A1234B",
  "123-XY",
  "ABC1111",
  "XYZ9999",
  "TEST123",
  "AB12CD3",
  "XX00XX0",
  "AB-C123",
  "A123@BC",
];

// Processando as placas
const results = [];
let invalidCount = 0;

plates.forEach((plate) => {
  if (isValidPlate(plate)) {
    try {
      const result = generateVehicleId(plate);
      results.push({
        ...result,
        vehicleId: result.vehicleId.toString(), // Converte BigInt para string
      });
    } catch (error) {
      console.error(`Erro ao processar a placa ${plate}: ${error.message}`);
    }
  } else {
    console.warn(`Placa inválida ignorada: ${plate}`);
    invalidCount++;
  }
});

// Estatísticas
console.log(`Placas válidas processadas: ${results.length}`);
console.log(`Placas inválidas ignoradas: ${invalidCount}`);

// Agrupando por região (exemplo básico)
const groupedByRegion = {
  Brasil: results.filter((r) => /^[A-Z]{3}[0-9]{4}$/.test(r.plate)),
  "Estados Unidos": results.filter((r) =>
    /^[A-Z0-9]{3,7}(-[A-Z0-9]{1,3})?$/.test(r.plate)
  ),
  Europa: results.filter((r) => /^[A-Z]-?[0-9A-Z]{5,7}$/.test(r.plate)),
  Outros: results.filter(
    (r) =>
      !/^[A-Z]{3}[0-9]{4}$|^[A-Z0-9]{3,7}(-[A-Z0-9]{1,3})?$|^[A-Z]-?[0-9A-Z]{5,7}$/.test(
        r.plate
      )
  ),
};

// Exportando resultados para arquivo JSON
const outputFile = "vehicle_ids.json";
fs.writeFileSync(
  outputFile,
  JSON.stringify({ results, groupedByRegion }, null, 4), // JSON.stringify agora funciona porque vehicleId é string
  "utf8"
);

console.log(`Resultados salvos em: ${outputFile}`);
