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

export function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const formattedText = (text: string) => {
  return text.replace(/\n/g, "<br>");
};

export const extractDescription = (note: string) => {
  let message = note;

  // Ganti newline menjadi <br>
  message = message.replace(/\r?\n/g, "<br>");

  // Ubah URL menjadi link
  message = message.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>'
  );

  return message;
};
