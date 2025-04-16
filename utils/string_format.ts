export function toCamelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.toUpperCase()
    )
    .replace(/\s+/g, "");
}

export function toSnakeCase(str) {
  return str
    .replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
    .replace(/^_/, ""); // Menghindari awalan dengan _
}

export function toKebabCase(str) {
  return str
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, ""); // Menghindari awalan dengan -
}

export function toPascalCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match) => match.toUpperCase())
    .replace(/\s+/g, "");
}
