export function toCamelCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.toUpperCase()
    )
    .replace(/\s+/g, "");
}

export function toSnakeCase(str: string) {
  return str
    .replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
    .replace(/^_/, ""); // Menghindari awalan dengan _
}

export function toKebabCase(str: string) {
  return str
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, ""); // Menghindari awalan dengan -
}

export function toPascalCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match) => match.toUpperCase())
    .replace(/\s+/g, "");
}
export function normalizePhone(number: any) {
  return number.replace(/^\+/, "").replace(/\D/g, "");
}

