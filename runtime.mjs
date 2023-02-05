class StackException {
    constructor(message) {
        this.message = message;
    }
}

class Stack {
    #stack;

    constructor(v) {
        if (!Array.isArray(v))
            throw new StackException("Expected array as constructor argument.");

        this.#stack = v; 
    }

    push(x) {
        this.#stack.push(x);
    }

    pop() {
        if (this.#stack.length == 0)
            throw new StackException("Stack underflow.");

        return this.#stack.pop();
    }
}
