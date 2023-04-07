var errorMessages = [];
const ERROR = "<error>";

function mangle() {
    const tbInput = document.getElementById("tbInput");
    const tbOutput = document.getElementById("tbOutput");

    errorMessages = []

    const tokens = split(tbInput.value);
    const mangled = mangleSymbol(tokens, false);

    tbOutput.value = mangled;
    checkError();
}

function checkError() {
    const tbErrorMessage = document.getElementById("tbErrorMessage");
    createErrorString(errorMessages, tbErrorMessage);

    if (errorMessages.length > 0) {
        tbInput.classList.add("Error");
    }
    else {
        tbInput.classList.remove("Error");
    }
}

function isValidName(name) {
    for (let i = 0; i < name.length; i++) {
        if (!((name[i] >= 'A' && name[i] <= 'Z') ||
            (name[i] >= 'a' && name[i] <= 'z') ||
            (name[i] >= '0' && name[i] <= '9') ||
            name[i] == '_')) {
                return false;
            }
    }

    return true;
}

function split(symbol) {
    result = []

    let start = 0;

    for (let i = 0; i < symbol.length; i++) {
        if (!isValidName(symbol[i])) {
            if (start != i) {
                result.push(symbol.substring(start, i));
            }

            if (symbol[i] != ' ') {
                result.push(symbol.substring(i, i + 1));
            }

            start = i + 1;
        }
    }

    if (start < symbol.length - 1) {
        result.push(symbol.substring(start, symbol.length));
    }

    return result
}

function mangleSymbol(tokens, includeType) {
    if (tokens.length > 0 && tokens[tokens.length - 1] == ";") {
        tokens.pop();
    }

    const returnType = mangleType(tokens);
    const name = mangleName(tokens);
    let func = "";

    if (tokens.length > 0) {
        func = mangleFunction(tokens);
    }

    let mangled = `${name}${func}`;

    if (includeType) {
        mangled += `_${returnType}`
    }
    
    return mangled;
}

function mangleType(tokens) {
    if (tokens.length == 0) {
        errorMessages.push("Expected type, found nothing.");
        return "";
    }

    let keywords = "";
    let keywordsSuffix = "";
    let type = "";
    let typeFound = false;
    let isFirstToken = true;

    while (tokens.length > 0) {
        const token = tokens[0];

        if (token in TYPE_KEYWORDS) {
            const keyword = TYPE_KEYWORDS[token];

            if (isFirstToken && token == "const") {
                keywordsSuffix += keyword;
            }
            else {
                keywords += keyword;
            }
        }
        else if (typeFound) {
            break;
        }
        else{
            type = token;
            typeFound = true;
        }
        
        tokens.shift();
        isFirstToken = false;
    }

    return `${keywords}${keywordsSuffix}${mangleTypeName(type)}`
}

function mangleName(tokens) {
    if (tokens.length == 0) {
        errorMessages.push("Expected name, found nothing.");
        return ERROR;
    }

    let names = [tokens.shift()]

    while (tokens.length > 2 && tokens[0] == ":" && tokens[1] == ":") {
        tokens.shift();
        tokens.shift();
        const name = tokens.shift();

        names.push(name);

        if (!isValidName(name)) {
            errorMessages.push(`Invalid name: '${name}'.`);
        }
    }

    let name = names.pop();

    if (names.length > 0) {
        name += "__";

        if (names.length > 1) {
            const qualNameCount = names.length; 
            name += `Q${qualNameCount}`;
        }

        for (let i = 0; i < names.length; i++) {
            name += mangleTypeName(names[i]);
        }
     }

    return name;
}

function mangleTypeName(typeName) {
    if (typeName in PRIMITIVE_TYPES) {
        return PRIMITIVE_TYPES[typeName];
    }

    return `${typeName.length}${typeName}`
}

function mangleFunction(tokens) {
    if (tokens.length == 0) {
        errorMessages.push("Expected '(', found nothing.");
        return ERROR;
    }

    nextToken = tokens.shift();

    if (nextToken != "(") {
        errorMessages.push(`Expected '(', found ${nextToken}.`);
        return ERROR;
    }

    let is_const_func = false;

    while (tokens.length > 0) {
        const token = tokens[tokens.length - 1];

        if (token == ")") {
            break;
        }

        switch (token) {
            case "const":
                is_const_func = true
                break;
            case "override":
                break;
            default:
                errorMessages.push(`Unexpected '${token}'.`);
                return ERROR;
        }

        tokens.pop();
    }

    if (tokens.length == 0) {
        errorMessages.push("Expected ')', found nothing.");
        return ERROR;
    }

    const lastToken = tokens[tokens.length - 1];

    if (lastToken != ")") {
        errorMessages.push(`Expected ')', found '${lastToken}'.`);
        return ERROR;
    }

    tokens.pop();

    if (tokens.length == 0) {
        tokens.push("void");
    }

    let mangled = is_const_func ? "CF" : "F";

    while (tokens.length > 0) {
        let argTokens = []

        while (tokens.length > 0 && tokens[0] != ",") {
            argTokens.push(tokens.shift());
        }

        if (tokens.length > 0 && tokens[0] == ",") {
            tokens.shift();
        }

        mangled += mangleFunctionArg(argTokens);
    }

    return mangled;
}

function mangleFunctionArg(tokens) {
    const type = mangleType(tokens);

    if (tokens.length > 1) {
        errorMessages.push(`Excepted nothing or argument name, found '${tokens.join(" ")}'`)
        return ERROR;
    }

    return type;
}

const PRIMITIVE_TYPES = {
    "bool": "b",
    "char": "c",
    "wchar_t": "w",
    "short": "s",
    "int": "i",
    "long": "l",
    "long long": "x",
    "float": "f",
    "double": "d",
    "void": "v",
    "...": "e"
};

const TYPE_KEYWORDS = {
    "*": "P", 
    "&": "R", 
    "const": "C", 
    "unsigned": "U", 
    "signed": "S",
};
