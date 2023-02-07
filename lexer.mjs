/**
 * @typedef {Object} TokenPosition - Token position.
 * @property {number} char - Character position. 
 * @property {number} line - Line position. 
 *  
 * @typedef {Object} Token - Token.
 * @property {TokenPosition} startingPosition - Token starting position. 
 * @property {TokenPosition} endingPosition - Token ending position. 
 * @property {string|number|Array<Token>} value - Token value. 
 * @property {string} type - Token type. 
 */

/**
 * Enum for token types.
 *
 * @readonly
 * @enum {string}
 */
export const TokenTypes = {
    NUMBER: "NUMBER",
    STRING: "STRING",
    FUNCTION: "FUNCTION",
    DICTIONARY: "DICTIONARY",
    ARRAY: "ARRAY",

    INSTRUCTION: "INSTRUCTION",
    PUSH_EXPRESSION: "PUSH_EXPRESSION",
    POP_EXPRESSION: "POP_EXPRESSION",

    LEFT_BRACE: "LEFT_BRACE",
    RIGHT_BRACE: "RIGHT_BRACE",

    EXCLAMATION_POINT: "EXCLAMATION_POINT",
    COLON: "COLON",

    LEFT_BRACKET: "LEFT_BRACKET",
    RIGHT_BRACKET: "RIGHT_BRACKET",

    ANY: "ANY"
};

/**
 * Enum for lexer states.
 *
 * @readonly
 * @enum {string}
 */
export const States = {
    SEEK: "SEEK",
    NUMBER: "NUMBER",
    STRING: "STRING",
    INSTRUCTION: "INSTRUCTION",
    EXPRESSION: "EXPRESSION"
};

export class LexerException {
    /**
     * Lexer exception.
     *
     * @param {string} message - Exception message.
     * @param {TokenPosition} position - Lexer position.
     */
    constructor(message, position) {
        this.message = message;
        this.position = position;
    }
}

/** Lexer class. */
export class Lexer {
    /**
     * Code to be lexed.
     *
     * @type {string}
     */
    code;

    /**
     * Current lexer position.
     *
     * @type {TokenPosition}
     */
    position = {
        char: 0,
        line: 1
    };

    /**
     * Current character.
     *
     * @type {string}
     */
    c;

    /** Lexer state */
    state = States.SEEK;

    /**
     * Generated tokens.
     *
     * @type {Array<Token>}
     */
    tokens = [];

    /** If the lexer's approaching the end. */
    #approachingEnd = false;

    #approachingNewToken = false;

    #stringEscape = false;

    /**
     * Lexes the given code.
     *
     * @param {string} code - Code to be parsed.
     */
    constructor(code) {
        this.code = code;

        this.#lex();
    }

    /**
     * Lexes the given code.
     */
    #lex() {
        for (let i = 0; i < this.code.length; i++) {
            this.c = this.code[i];

            if (this.c == '\n') {
                this.position.char = 1;
                this.position.line++;
            } else this.position.char++;

            this.#approachingEnd = ((i + 1) >= this.code.length);

            this.#approachingNewToken = [
                '{',
                '}',
                '[',
                ']',
                '"',
                '!',
                ':'
            ].includes(this.c);

            switch (this.state) {
                case States.SEEK:
                    this.#onSeek();

                    break;

                case States.NUMBER:
                    this.#onNumber();

                    break;

                case States.STRING:
                    this.#onString();

                    break;

                case States.INSTRUCTION:
                    this.#onInstruction();

                    break;

                case States.EXPRESSION:
                    this.#onExpression();

                    break;
            }
        }

        this.#onEnd();
    }

    /**
     * Gets executed when state = States.SEEK.
     */
    #onSeek() {
        // NOTE: Setting directly `endingPosition = this.position` doesn't work!

        if (this.c == '[')
            this.tokens.push({
                type: TokenTypes.LEFT_BRACKET,
                value: '[',
                startingPosition: structuredClone(this.position),
                endingPosition: structuredClone(this.position)
            });
        else if (this.c == ']')
            this.tokens.push({
                type: TokenTypes.RIGHT_BRACKET,
                value: ']',
                startingPosition: structuredClone(this.position),
                endingPosition: structuredClone(this.position)
            });
        else if (this.c == '{')
            this.tokens.push({
                type: TokenTypes.LEFT_BRACE,
                value: '{',
                startingPosition: structuredClone(this.position),
                endingPosition: structuredClone(this.position)
            });
        else if (this.c == '}')
            this.tokens.push({
                type: TokenTypes.RIGHT_BRACE,
                value: '}',
                startingPosition: structuredClone(this.position),
                endingPosition: structuredClone(this.position)
            });
        else if (this.c == '!') 
            this.tokens.push({
                type: TokenTypes.EXCLAMATION_POINT,
                value: '!',
                startingPosition: structuredClone(this.position),
                endingPosition: structuredClone(this.position)
            });
        else if (this.c == ':') 
            this.tokens.push({
                type: TokenTypes.COLON,
                value: ':',
                startingPosition: structuredClone(this.position),
                endingPosition: structuredClone(this.position)
            });
        else if (/([0-9]|-|\+)/.test(this.c)) {
            this.state = States.NUMBER;
            this.tokens.push({
                type: TokenTypes.NUMBER,
                value: this.c,
                startingPosition: structuredClone(this.position),
                endingPosition: undefined
            });
        } else if (this.c == '"') {
            this.state = States.STRING;
            this.tokens.push({
                type: TokenTypes.STRING,
                value: "",
                startingPosition: structuredClone(this.position),
                endingPosition: undefined
            });
        } else if (/[a-z]/.test(this.c) || this.c == '#') {
            this.state = States.INSTRUCTION;
            this.tokens.push({
                type: TokenTypes.INSTRUCTION,
                value: this.c,
                startingPosition: structuredClone(this.position),
                endingPosition: undefined
            });
        } else if (this.c == "$" || this.c == "&") {
            this.state = States.EXPRESSION;
            this.tokens.push({
                type: (this.c == "&") ? TokenTypes.POP_EXPRESSION : TokenTypes.PUSH_EXPRESSION,
                value: this.c,
                startingPosition: structuredClone(this.position),
                endingPosition: undefined
            });
        } else if (!this.#isWhitespace())
            throw new LexerException(`Unknown character '${this.c}'`, this.position);

        return;
    }

    /**
     * Checks if the current character is a whitespace.
     */
    #isWhitespace() {
        switch (this.c) {
            case '\n': return true;
            case '\t': return true;
            case ' ':  return true;
        }

        return false;
    }

    /**
     * Gets executed when state = States.NUMBER.
     */
    #onNumber() {
        if (
            this.#isWhitespace()
        ) {
            this.state = States.SEEK;
            // NOTE: Setting directly `endingPosition = this.position` doesn't work!
            this.tokens[this.tokens.length - 1].endingPosition = structuredClone(this.position);

            return;
        } else if (this.#approachingNewToken) {
            this.state = States.SEEK;
            // NOTE: Setting directly `endingPosition = this.position` doesn't work!
            this.tokens[this.tokens.length - 1].endingPosition = structuredClone(this.position);
            this.#onSeek();

            return;
        }

        if (this.#approachingEnd) {
            this.tokens[this.tokens.length - 1].endingPosition = structuredClone(this.position);
        }

        if (
            /[0-9]/.test(this.c) ||
            (
                !this.tokens[this.tokens.length - 1].value.includes('.') &&
                this.c == '.' &&
                /[0-9]/.test(this.tokens[this.tokens.length - 1].value)
            )
        ) {
            this.tokens[this.tokens.length - 1].value += this.c;
        } else
            throw new LexerException(`Invalid number character: '${this.c}'`, this.position);

        return;
    }

    #onString() {
        // cf. JSON specification for strings.
        // The only difference is that JSON has \u, FLeX doesn't.

        if (this.#stringEscape) {
            if (this.c == '"')
                this.tokens[this.tokens.length - 1].value += '"';
            else if (this.c == '\\')
                this.tokens[this.tokens.length - 1].value += '\\';
            else if (this.c == '/')
                this.tokens[this.tokens.length - 1].value += '\/';
            else if (this.c == 'b')
                this.tokens[this.tokens.length - 1].value += '\b';
            else if (this.c == 'f')
                this.tokens[this.tokens.length - 1].value += '\f';
            else if (this.c == 'n')
                this.tokens[this.tokens.length - 1].value += '\n';
            else if (this.c == 'r')
                this.tokens[this.tokens.length - 1].value += '\r';
            else
                throw new LexerException(`Invalid escape sequence: '\\${this.c}'`, this.position);
            
            this.#stringEscape = false;

            return;
        }

        if (this.c == '\\') {
            this.#stringEscape = true;            
        } else if (this.c == '"') {
            this.state = States.SEEK;

            // NOTE: Setting directly `endingPosition = this.position` doesn't work!
            this.tokens[this.tokens.length - 1].endingPosition = structuredClone(this.position);
        } else this.tokens[this.tokens.length - 1].value += this.c;
    }

    #onInstruction() {
        if (
            this.#isWhitespace()
        ) {
            this.state = States.SEEK;
            // NOTE: Setting directly `endingPosition = this.position` doesn't work!
            this.tokens[this.tokens.length - 1].endingPosition = structuredClone(this.position);

            return;
        } else if (this.#approachingNewToken) {
            this.state = States.SEEK;
            // NOTE: Setting directly `endingPosition = this.position` doesn't work!
            this.tokens[this.tokens.length - 1].endingPosition = structuredClone(this.position);
            this.#onSeek();

            return;
        }

        if (this.#approachingEnd)
            this.tokens[this.tokens.length - 1].endingPosition = structuredClone(this.position);

        if (/[a-z-]/.test(this.c)) {
            this.tokens[this.tokens.length - 1].value += this.c;
        } else
            throw new LexerException(`Invalid instruction character: '${this.c}'`, this.position);

        return;
    }

    #onExpression() {
        if (
            this.#isWhitespace()
        ) {
            this.state = States.SEEK;
            // NOTE: Setting directly `endingPosition = this.position` doesn't work!
            this.tokens[this.tokens.length - 1].endingPosition = structuredClone(this.position);

            if (
                this.tokens[this.tokens.length - 1].value == "$" ||
                this.tokens[this.tokens.length - 1].value == "&"
            )
                throw new LexerException(`Invalid empty expression (\`$')`, this.position);

            return;
        } else if (this.#approachingNewToken) {
            if (
                this.tokens[this.tokens.length - 1].value == "$" ||
                this.tokens[this.tokens.length - 1].value == "&"
            )
                throw new LexerException(`Invalid empty expression (\`$')`, this.position);

            this.state = States.SEEK;
            // NOTE: Setting directly `endingPosition = this.position` doesn't work!
            this.tokens[this.tokens.length - 1].endingPosition = structuredClone(this.position);
            this.#onSeek();

            return;
        }

        if (this.#approachingEnd) {
            if (
                this.tokens[this.tokens.length - 1].value == "$" ||
                this.tokens[this.tokens.length - 1].value == "&"
            )
                throw new LexerException(`Invalid empty expression (\`$')`, this.position);

            this.tokens[this.tokens.length - 1].endingPosition = structuredClone(this.position);
        }

        if (
            /[a-z-]/.test(this.c) ||
            (this.c == "." &&
            this.tokens[this.tokens.length - 1].value.slice(-1) != ".") ||
            (this.c == "$" &&
            this.tokens[this.tokens.length - 1].value.slice(-1) != "$")
        ) {
            this.tokens[this.tokens.length - 1].value += this.c;
        } else
            throw new LexerException(`Invalid expression character: '${this.c}'`, this.position);

        return;
    }

    #onEnd() {
        if (this.tokens.length == 0) return;

        if (this.tokens[this.tokens.length - 1].endingPosition !== undefined) return;

        switch (this.tokens[this.tokens.length - 1].type) {
            // missing "
            case TokenTypes.STRING:
                throw new LexerException("Unfinished token at EOF");

            case TokenTypes.PUSH_EXPRESSION:
                if (this.tokens[this.tokens.length -1].value == "$")
                    throw new LexerException("Empty push expression at EOF");

                break;

            case TokenTypes.POP_EXPRESSION:
                if (this.tokens[this.tokens.length -1].value == "&")
                    throw new LexerException("Empty pop expression at EOF");

                break;


            default:
                this.tokens[this.tokens.length - 1].endingPosition = structuredClone(this.position);

                break;
        }
    }
}
