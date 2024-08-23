export class cout {
  static write(message = '') {
    process.stdout.write(message);
  }

  static writeLine(message = '') {
    cout.write(`${message}\n`);
  }

  static replaceCurrentLine(message = '') {
    cout.write("\x1b[2K");
    process.stdout.cursorTo(0);
    cout.write(message);
  }
}

export default cout;
