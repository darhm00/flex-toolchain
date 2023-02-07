export function isSimplePushExpr(expr) {
    return /^\$[a-z-]+$/.test(expr);
}

export function isSimplePopExpr(expr) {
    return /^&[a-z][a-z-]*$/.test(expr);
}

export function isPushExpr(expr) {
    return /^\$[a-z-]+(\.(\$[0-9]+|\$[a-z-]+|[a-z-]+|[0-9]+))+$/.test(expr);
}

export function isPopExpr(expr) {
    return /^&[a-z-]+(\.(\$[0-9]+|\$[a-z-]+|[a-z]+|[0-9]+))+$/.test(expr);
}

export function getIndexMap(expr) {
    if (!isPushExpr(expr) || !isPopExpr(expr))
        throw "Can't get index map of non-expr or simple expr.";

    expr = expr.split('.');
    expr.shift();

    // $hello.0.0 --> 0.0
    return expr.join(".");
}

console.log(isPushExpr("$asd.0.$0.$hello.hello"));
