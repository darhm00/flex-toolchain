import { Parser } from "./parser.mjs";
import { Lexer, TokenTypes } from "./lexer.mjs";
import { Stack } from "./runtime.mjs";

const InstructionTypes = {
    INSTRUCTION: "INSTRUCTION",
    PUSH_EXPRESSION: "PUSH_EXPRESSION",
    POP_EXPRESSION: "POP_EXPRESSION",
    FUNCTION_REFERENCE: "FUNCTION_REFERENCE",
    PUSH_LITERAL: "PUSH_LITERAL"
};

class Evaluator {
    #tokens;
    #functions = {};
    #api = {};

    constructor(tokens, api = undefined) {
        this.#tokens = tokens;

        this.#nameFunctions();

        if (api == undefined)
            this.#api = {
                stack: new Stack(),
                functions: this.#functions
            };
        else if (!Array.isArray(api) && typeof api == 'object')
            this.#api = api;
        else
            throw "Expected array as constructor argument api.";

        this.#evaluate(this.#functions.main);
    }

    #evaluate(instructions) {
        for (let i = 0; i < instructions.length; i++) {
            let instr = this.#tokens[i];

            switch (instr.type) {
                case InstructionTypes.INSTRUCTION:
                    if (!instr.startsWith('#'))
                        this.#evaluate(this.#api[instr.value].value);
                    else
                        this.#executeSharp(instr.value);

                    break;

                case InstructionTypes.PUSH_EXPRESSION:
                    break;

                case InstructionTypes.POP_EXPRESSION:
                    break;

                case InstructionTypes.FUNCTION_REFERENCE:
                    break;

                case InstructionTypes.PUSH_LITERAL:
                    break;
            }
        }
    }

    #executeSharp(instr) {
        switch (instr) {
            case "#print":
                console.log(this.#api.stack.pop());
        }
    }

    #generateId(size = 4) {
        return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    #nameFunctions(
        tokens = this.#tokens,
        functionName = "main",
        parent = "",
        tokenNum = -2
    ) {
        let id, type;

        this.#functions[functionName] = {
            parent: parent,
            value: [],
            tokenNum: tokenNum,
            vars: {}
        };

        for (let i = 0, token = tokens[i]; i < tokens.length; i++, token = tokens[i]) {
            if (token.type == TokenTypes.FUNCTION) {
                id = this.#generateId();

                while (this.#functions[functionName + "_" + id] != undefined)
                    id = this.#generateId();

                this.#nameFunctions(
                    token.value,
                    functionName + "_" + id,
                    functionName,
                    i
                );

                this.#functions[functionName].value.push({
                    type: InstructionTypes.FUNCTION_REFERENCE,
                    value: functionName + "_" + id,
                    tokenNum: i
                });
            } else {
                switch (token.type) {
                    case TokenTypes.PUSH_EXPRESSION:
                        type = InstructionTypes.PUSH_EXPRESSION;

                        break;

                    case TokenTypes.POP_EXPRESSION:
                        type = InstructionTypes.POP_EXPRESSION;

                        break;

                    case TokenTypes.INSTRUCTION:
                        type = InstructionTypes.INSTRUCTION;

                        break;

                    default:
                        type = InstructionTypes.PUSH_EXPRESSION;

                        break;
                }

                this.#functions[functionName].value.push({
                    type: type,
                    value: token.value,
                    tokenNum: i
                });
            }
        }
    }
}

const code = `
    {1 {1}}
`;

let tokens = new Parser(new Lexer(code).tokens).result;

let e = new Evaluator(tokens);
