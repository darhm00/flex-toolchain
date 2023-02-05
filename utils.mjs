import { TokenTypes } from "./lexer.mjs";

const TermColors = {
    RED: '\u001b[31m',
    GREEN: '\u001b[32m',
    YELLOW: '\u001b[33m',
    BLUE: '\u001b[34m',
    MAGENTA: '\u001b[35m',
    CYAN: '\u001b[36m',
    WHITE: '\u001b[37m',
    RESET: '\u001b[0m'
};

const color = {
    red: x => TermColors.RED + x + TermColors.RESET,
    green: x => TermColors.GREEN + x + TermColors.RESET,
    yellow: x => TermColors.YELLOW + x + TermColors.RESET,
    cyan: x => TermColors.CYAN + x + TermColors.RESET,
    magenta: x => TermColors.MAGENTA + x + TermColors.RESET,
    blue: x => TermColors.BLUE + x + TermColors.RESET
}

export function tokenPrettyPrint(token) {
    let
        startingPosition = `(${color.yellow(token.startingPosition.char)}, ${color.yellow(token.startingPosition.line)})`,
        endingPosition = `(${color.yellow(token.endingPosition.char)}, ${color.yellow(token.endingPosition.line)})`,
        type = `${color.magenta(token.type)}`,
        output = '',
        childOutput = '';

    switch (token.type) {
        case TokenTypes.FUNCTION:
            output += `${color.blue("BEGIN")} ${type}(${color.green("...")}) ${startingPosition} -> ${endingPosition}\n`;
            childOutput = '';

            token.value.forEach(t => {
                childOutput += tokenPrettyPrint(t);
            });

            output += childOutput.split('\n').map(x => '    ' + x).join('\n').trimEnd() + '\n';
            output += `${color.blue("END")} ${type}(${color.green("...")}) ${startingPosition} -> ${endingPosition}\n`;

            break;

        case TokenTypes.ARRAY:
            output += `${color.blue("BEGIN")} ${type}(${color.green("...")}) ${startingPosition} -> ${endingPosition}\n`;
            childOutput = '';

            token.value.forEach(t => {
                childOutput += tokenPrettyPrint(t);
            });

            output += childOutput.split('\n').map(x => '    ' + x).join('\n').trimEnd() + '\n';
            output += `${color.blue("END")} ${type}(${color.green("...")}) ${startingPosition} -> ${endingPosition}\n`;

            break;

        case TokenTypes.DICTIONARY:
            output += `${color.blue("BEGIN")} ${type}(${color.green("...")}) ${startingPosition} -> ${endingPosition}\n`;
            childOutput = '';

            token.value.forEach(pair => {
                let key = pair.key,
                    value = pair.value;

                childOutput += `${color.red("key")}:   `;
                childOutput += tokenPrettyPrint(key);

                childOutput += `${color.red("value")}: `;
                childOutput += tokenPrettyPrint(value);
            });

            output += childOutput.split('\n').map(x => '    ' + x).join('\n').trimEnd() + '\n';

            output += `${color.blue("END")} ${type}(${color.green("...")}) ${startingPosition} -> ${endingPosition}\n`;

            break;

        case TokenTypes.ARRAY:
            break;

        default:
            output += `${type}(${color.green(JSON.stringify(token.value))}) ${startingPosition} -> ${endingPosition}\n`;
            break;
    }

    return output;
}

export function tokensPrettyPrint(tokens) {
    let output = '';

    tokens.forEach(token => {
        output += tokenPrettyPrint(token)
    });

    return output;
}

