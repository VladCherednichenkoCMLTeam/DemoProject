export const isValidFileType = (file: File): boolean => {
  const allowedTypes = ["text/plain", "application/pdf"];
  return allowedTypes.includes(file.type);
};
