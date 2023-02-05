# Quick note
To fully understand this document some programming comptetence is required.

# Stack & variables
FLeX uses a LiFo stack, the stack has a global scope, so all the functions
operate with the same stack. Variables are related to the function's scope,
functions can only modify variables inside the function's scope.

# Instructions
## Instruction types
There are several instructions:
 - `INSTRUCTION` - calls a function;
 - `PUSH_EXPRESSION` - pushes a variable in the stack;
 - `POP_EXPRESSION` - pops into a variable;
 - `FUNCTION_REFERENCE` - references a function in the stack;
 - `PUSH_LITERAL` - pushes a literal value;
**NOTE**": Function references are used to push functions on the stack.

## Instruction syntax
This is the instruction syntax, variables and functions are named `like-this`,
`notLikeThis` and `not_like_this`:
```
' this is a comment,
' possible instructions:

hello-world  ' this is an instruction
#hello-world ' this is a builtin instruction
$hello       ' this is a push expression
&hello       ' this is a pop expression
{ hello }    ' this is a function reference (we are pushing a function in the stack)
"Hello"      ' this is a push literal instruction
123456       ' this is a push literal instruction
[1 2 3 4 5]  ' this is a push literal instruction
!{$a: 1212}  ' this is a push literal instruction
```

# Data types
There are several data types:
 - `STRING` - equivalent to javascript;
 - `NUMBER` - equivalent to javascript;
 - `ARRAY` - ordered collection of elements;
 - `FUNCTION`/`FUNCTION_REFERENCE` - anonymous function;
 - `DICTIONARY` - collection of named elements;
 - `BOOLEAN` - `true` or `false`;
 - `NULL` - equivalent to javascript `undefined`;

These are some data type examples:
```
' Dictionary (the value can be any data type)
!{
    $my-key: "My value"
    $other-key: $some-variable
    $another-key: 0
}

' Array (the value can be any data type)
[ 1 2 3 "Hello, World" $something ]

' Function
{ "Hello, World" #print }
```
**NOTE**: All of this instructions are a `PUSH_LITERAL` (except the function
which is a `FUNCTION_REFERENCE`).
**NOTE**<sub>2</sub>: Strings can have escape sequence (`\` + character) to
represent some characters (`"`, newline, tab, `\\`).

# Expressions
There are 2 types of expressions:
 - `PUSH_EXPRESSION` - pushes a variable on the stack;
 - `POP_EXPRESSION` - pops into a variable.

These are some examples:
| Push expression | JavaScript translation                             |
|-----------------|----------------------------------------------------|
| `$a.$b.b.1`     | `push(a[b]["b"][1]`                                |
| `$a.$0.$1`      | `push(a[s[s.length - 1 - 0]][s[s.length - 1 -1]])` |
| `$a.0.hi.0`     | `push(a[0]["hi"][0])`                              |
| `$a`            | `push(a)`                                          |

| Pop expression  | JavaScript translation                               |
|-----------------|------------------------------------------------------|
| `&x.0.0`        | `a[b]["b"][1] = pop()`                               |
| `&x`            | `x = pop()`                                          |
| `&x.hi.0`       | `x["hi"][0] = pop()`                                 |
| `&a.$0.$1`      | `a[s[s.length - 1 - 0]][s[s.length - 1 -1]] = pop()` |
**NOTE**: `s` is the stack.

# API
The TypeScript interface for the FLeX API would look something like this:
```typescript
interface Function {
    code: Array<Instruction>,
    [variables: string]: any,
    parent: string
}

interface API {
    stack: Stack,
    [functions: string]: Function
}
```

# EBNF Grammar
```
program        = {ws , instr , ws} .

escapeSeq      = '\\' , ('"' | '\\' | '/' | 'b' | 'f' | 'n' | 'r') .
string         = '"' , { char | escapeSequence } '"' .

number         = ["+" | "-"] , digit , {digit} , ["." , {digit}] .

array          = "[" , ws , {ws , (pushLiteral | pushExpr) , ws} , ws , "]" .

function       = "{" , ws , { ws , instr , ws } , ws , "}" .

dict           = "!{" , {ws , dictKey , ws , ":" , ws, dictValue , ws} , "}" .

dictValue      = pushExpr | pushLiteral .
dictKey        = simplePushExpr .

pushLiteral    = number | string | function | array | dict .

instr          = instrCall | pushExpr | popExpr | pushLiteral .
instrName      = alphabet , {alphabet | "-"} .
instrCall      = instrName | ("#" , instrName) .

simplePushExpr = "$" , instructionName .
stackPushExpr  = "$" , digit , {digit} .

index          = simplePushExpr
               | stackPushExpr
               | digit, {digit}
               | instrName
               .

pushExpr       = simplePushExpr , {"." , (index)} 
               | simplePushExpr
               | stackPushExpr
               .

simplePopExpr  = "&" , instructionName .

popExpr        = simplePopExpr , {"." , (index)} 
               | simplePopExpr
               .

ws             = {'\n' | '\t' | ' '} .
```
**NOTE**: `char` is `/./`, `digit` is `/[0-9]/`, `alphabet` is `[a-z]`.
