class Player {
    constructor(id, miiName, loungeName) {
        this.id = id;
        this.miiName = miiName;
        this.loungeName = loungeName;
    }
}

var apErrors = [];

function genTable() {
    apErrors = [];

    const tbAp = document.getElementById("tbAp");
    const tbErrors = document.getElementById("tbApErrors");
    const tableGp = document.getElementById("tableGp");

    while (tableGp.rows.length > 1) {
        tableGp.deleteRow(-1);
    }

    for (const line of tbAp.value.split("\n")) {
        // Parse id
        const periodIndex = line.indexOf(".");

        if (periodIndex < 0) {
            apErrors.push(`Missing '.' on line '${line}'.`);
            continue;
        }

        const playerID = parseInt(line.substring(0, periodIndex).trim());

        if (isNaN(playerID)) {
            apErrors.push(`Invalid player id on line '${line}'.`);
            continue;
        }
        
        // Parse lounge name
        const startParIndex = line.lastIndexOf("(");
        const endParIndex = line.lastIndexOf(")");

        if (startParIndex < 0 || endParIndex < 0) {
            apErrors.push(`Missing '(' and/or ')' on line '${line}'.`);
            continue;
        }

        const loungeName = line.substring(startParIndex + 1, endParIndex).trim();

        // Parse mii name
        const dashIndex = line.lastIndexOf("-", startParIndex);

        if (dashIndex < 0) {
            apErrors.push(`Missing '-' on line '${line}'.`);
            continue;
        }

        const miiName = line.substring(periodIndex + 1, dashIndex - 1).trim();

        // Check if there's nothing more
        if (line.substring(endParIndex + 1).trim().length > 0) {
            apErrors.push(`Expected nothing after ')' on line '${line}'.`);
            continue;
        }

        // Create row
        const row = document.createElement("tr");
        tableGp.appendChild(row);

        const playerIDElem = document.createElement("td");
        playerIDElem.innerHTML = playerID;
        playerIDElem.style.textAlign = "right";
        row.appendChild(playerIDElem);

        const loungeNameElem = document.createElement("td");
        loungeNameElem.innerHTML = loungeName;
        row.appendChild(loungeNameElem);

        const miiNameElem = document.createElement("td");
        miiNameElem.innerHTML = miiName;
        row.appendChild(miiNameElem);

        const scoreElem = document.createElement("td");
        scoreElem.setAttribute("contenteditable", "true");
        scoreElem.innerHTML = "";
        scoreElem.style.textAlign = "right";
        row.appendChild(scoreElem);

        scoreElem.addEventListener("input", genCommand);
    }

    checkError(apErrors, tbErrors, tbAp);    
}

function genCommand() {
    const tableGp = document.getElementById("tableGp");
    const tbCommand = document.getElementById("tbCommand");

    let command = "gpedit <gp>";

    for (let i = 1; i < tableGp.children.length; i++) {
        const row = tableGp.children[i];
        const scoreElem = row.children[3];
        let score = scoreElem.innerHTML;

        if (isNaN(parseInt(score))) {
            scoreElem.classList.add("Error");
            score = "<invalid>";
        }
        else {
            scoreElem.classList.remove("Error");
        }

        command += ` ${score}`;
    }

    tbCommand.value = command;
}

function checkError(errorList, tbError, tbInput) {
    createErrorString(errorList, tbError);

    if (tbInput) {
        if (errorList.length > 0) {
            tbInput.classList.add("Error");
        }
        else {
            tbInput.classList.remove("Error");
        }
    }
}  
