
const initialLength = 4;
const generatePatterns = (levelCount, options = ['#c0392b', '#2980b9', '#27ae60', '#f1c40f'], stepSize = 1) => {
  const patternsByLevel = {};
  for (let i = 0; i < levelCount; i++) {
    const patternLength = initialLength + stepSize * i;
    const current = [...new Array(patternLength).keys()].map(_ => {
      // Return random color
      return options[Math.floor(Math.random() * 4)];
    })
    patternsByLevel[i+1] = current;
  }
  return {
    levelCount,
    patternsByLevel,
    colorCodes: options,
  };
}

export const levelConfig = generatePatterns(10);