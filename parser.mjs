import { TokenTypes } from "./lexer.mjs";

// TODO: Replace throw <String> with throw <ParserException>

export class Parser {
    #tokens;

    #i = -1;
    #token;
    #expected = TokenTypes.ANY;

    result = [];

    constructor(tokens) {
        this.#tokens = tokens;

        this.#parse();
    }

    #parse() {
        this.#next();

        while (!this.#hasFinished()) {
            if (!this.#isValid())
                throw `Unexpected token ${this.#token.type}, expected ${this.#expected}`;

            this.result.push(this.#handleToken());

            this.#next();
        }
    }

    #next() {
        this.#i++;
        this.#token = this.#tokens[this.#i];
    }

    #hasFinished() {
        return (this.#i >= this.#tokens.length)
    }

    #isValid() {
        return (
            this.#expected == TokenTypes.ANY ||
            (
                Array.isArray(this.#expected) &&
                this.#expected.includes(this.#token.type)
            ) ||
            this.#expected == this.#token.type
        );
    }

    #handleToken() {
        switch (this.#token.type) {
            case TokenTypes.EXCLAMATION_POINT: return this.#handleDictionary();
            case TokenTypes.LEFT_BRACE:        return this.#handleFunction();
            case TokenTypes.LEFT_BRACKET:      return this.#handleArray();
            case TokenTypes.COLON:             throw "Unexpected COLON";
            default:                           return this.#token;
        }
    }

    #handleFunction() {
        let result = [], startingPosition = this.#token.startingPosition;
        this.#expected = TokenTypes.ANY;

        this.#next();

        while (!this.#hasFinished()) {
            if (!this.#isValid())
                throw `Unexpected token ${this.#token.type}, expected ${this.#expected}`;

            if (this.#token.type == TokenTypes.RIGHT_BRACE)
                return {
                    value: result,
                    type: TokenTypes.FUNCTION,
                    startingPosition: startingPosition,
                    endingPosition: this.#token.endingPosition
                };

            result.push(this.#handleToken());

            this.#next();
        }

        throw "Missing RIGHT_BRACE at EOF";
    }

    #handleArray() {
        let result = [], startingPosition = this.#token.startingPosition;
        this.#expected = TokenTypes.ANY;

        this.#next();

        while (!this.#hasFinished()) {
            if (!this.#isValid())
                throw `Unexpected token ${this.#token.type}, expected ${this.#expected}`;

            if (this.#token.type == TokenTypes.RIGHT_BRACKET)
                return {
                    value: result,
                    type: TokenTypes.ARRAY,
                    startingPosition: startingPosition,
                    endingPosition: this.#token.endingPosition
                };

            result.push(this.#handleToken());

            this.#next();
        }

        throw "Missing RIGHT_BRACKET at EOF";
    }
    #handleDictionary() {
        let result = [], key;
        const startingPosition = structuredClone(this.#token.startingPosition);

        this.#next();

        if (this.#hasFinished())
            throw "unfinished dictionary";

        if (this.#token.type != TokenTypes.LEFT_BRACE)
            throw `unexpected ${this.#token.type} expected LEFT_BRACE`;
        else this.#next();

        // whitespace, pushExpr , ":" , any , whitespace
        this.#expected = [TokenTypes.PUSH_EXPRESSION, TokenTypes.RIGHT_BRACE];

        while (!this.#hasFinished()) {
            if (!this.#isValid())
                throw `Unexpected token ${this.#token.type}, expected ${this.#expected}`;

            if (this.#token.type == TokenTypes.RIGHT_BRACE) {
                this.#expected = TokenTypes.ANY;

                return {
                    type: TokenTypes.DICTIONARY,
                    value: result,
                    startingPosition: startingPosition,
                    endingPosition: this.#token.endingPosition
                };
            }
                
            if (JSON.stringify(this.#expected) == JSON.stringify([TokenTypes.PUSH_EXPRESSION, TokenTypes.RIGHT_BRACE])) {

                key = this.#handleToken();

                this.#expected = TokenTypes.COLON;
            } else if (this.#expected == TokenTypes.COLON) {
                this.#expected = TokenTypes.ANY;
            } else if (this.#expected == TokenTypes.ANY) {
                result.push({
                    key: key,
                    value: this.#handleToken()        
                });

                this.#expected = [TokenTypes.PUSH_EXPRESSION, TokenTypes.RIGHT_BRACE];
            }

            this.#next();
        }

        throw "Missing RIGHT_BRACE at EOF";

    }
}
