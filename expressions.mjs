/**
 * indexMap: 0.0.hello.1
 * indexMap: term , {term}
 * name: test
 */

function getIndexMap(value, indexMap) {
    const variables = indexMap.split(".");
    let v;

    variables.forEach((term) => {
        console.log(term);

        v = (Number.isNaN(Number(term))) ? term : Number(term);

        if (typeof value != "object")
            throw "can't get index of non-object value";

        value = value[v];
    });

    return value;
}

function setIndexMap(value, newValue, indexMap) {
    const variables = indexMap.split(".");
    let _, v;

    for (let i = 0, variable = variables[i]; i < variables.length; i++, variable = variables[i]) {
        v = (Number.isNaN(Number(variable))) ? variable : Number(variable);

        if (Array.isArray(value[v])) {
            _ = indexMap.split(".");

            _.splice(0, i + 1);
            value[v] = setIndexMap(value[v], newValue, _.join("."));

            return value;
        } else if (i == (variables.length - 1)) {
            value[Number(variable)] = newValue;

            return value;
        } else throw "Unexpected term in index map.";
    }
}

console.log(getIndexMap({x: [0,1,2]}, "x.0"));
console.log(setIndexMap({x: [0,1,2]}, 10, "x.0"));
