function createErrorString(errorMessages, tbErrors) {    
    let betterMessages = [];

    for (const message of errorMessages) {
        betterMessages.push(`<span style="color:red">ERROR</span>: ${message}`)
    }

    tbErrors.innerHTML = betterMessages.join("<br>");
}

function roundDecimals(value, decimals) {
    pow = Math.pow(10, decimals);

    return Math.round(value * pow) / pow;
}
