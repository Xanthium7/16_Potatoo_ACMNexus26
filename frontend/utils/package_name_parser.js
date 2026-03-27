function extractPackageName(fileContent) {
  try {
    const data = JSON.parse(fileContent);

    const packageName = data.name;

    if (!packageName) {
      return null;
    }

    return packageName;
  } catch (error) {
    console.error("Error parsing package.json:", error);
    return null;
  }
}

export { extractPackageName };