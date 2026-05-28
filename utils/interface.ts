export const wrapUniqueCode = (unique: string) => {
  const split = unique.split("/");
  return `${split[0]}...${split[split.length - 1]}`;
};
