const ANSI = {
  // Modifiers
  reset: [0, 0],
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  overline: [53, 55],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],
  visible: [0, 0], // Kept for compatibility

  // Colors
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  blackBright: [90, 39],
  gray: [90, 39],
  grey: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39],

  // Background colors
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],
  bgBlackBright: [100, 49],
  bgGray: [100, 49],
  bgGrey: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49]
};

function createChalk(styles = []) {
  const builder = function (...args) {
    const text = args.join(' ');
    // If no styles apply, return standard text
    if (!styles.length) return text;
    
    let result = text;
    // Iterate over styles sequentially
    for (const style of styles) {
      const seq = ANSI[style];
      if (seq) {
        const [start, end] = seq;
        const open = `\x1b[${start}m`;
        const close = `\x1b[${end}m`;
        
        // This splits by the close tag of the current style and replaces it 
        // with the opening tag to handle nested styles effectively!
        if (result.includes(close)) {
          result = result.split(close).join(open);
        }
        
        result = `${open}${result}${close}`;
      }
    }
    return result;
  };

  return new Proxy(builder, {
    get(target, prop) {
      if (prop in ANSI) {
        // Build a cascading structure without mutating standard function
        return createChalk([...styles, prop]);
      }
      return Reflect.get(target, prop);
    }
  });
}

// Instantiate root 
const chalk = createChalk();

// Properties requested in the README documentation spec
chalk.modifierNames = ['reset', 'bold', 'dim', 'italic', 'underline', 'overline', 'inverse', 'hidden', 'strikethrough', 'visible'];
chalk.foregroundColorNames = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'blackBright', 'gray', 'grey', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'];
chalk.backgroundColorNames = ['bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite', 'bgBlackBright', 'bgGray', 'bgGrey', 'bgRedBright', 'bgGreenBright', 'bgYellowBright', 'bgBlueBright', 'bgMagentaBright', 'bgCyanBright', 'bgWhiteBright'];
chalk.colorNames = [...chalk.foregroundColorNames, ...chalk.backgroundColorNames];

// Defaulting to assuming truecolor/terminal support locally for standard override
chalk.level = 3; 

module.exports = chalk;
