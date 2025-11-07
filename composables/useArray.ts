export const useArray = () => {
  const removeDuplicates = <T>(array: T[], key: keyof T): T[] => {
    const uniqueMap = new Map();
    array.forEach(item => {
        const keyValue = item[key];
        if (!uniqueMap.has(keyValue)) {
        uniqueMap.set(keyValue, item);
        }
    });
    return Array.from(uniqueMap.values());
  };

  return { removeDuplicates };
};