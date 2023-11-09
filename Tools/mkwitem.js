function initTable() {
    createTable("tableItem");
    createTable("tableAvail");

    // Player count options
    const playerSelectElem = document.getElementById("selectPlayerCount");

    for (const playerCount in ITEM_TABLE) {
        const playerElem = document.createElement("option");
        playerElem.setAttribute("value", playerCount);
        playerElem.innerHTML = playerCount;

        playerSelectElem.appendChild(playerElem);
    }

    playerSelectElem.value = 10;

    // Item probability options
    const itemElem = document.getElementById("selectItem");

    for (let i = 0; i < ITEM_INFO.length; i++) {
        const item = ITEM_INFO[i];

        const optionElem = document.createElement("option");
        optionElem.style.backgroundImage = `url(../Images/Items/${item[0]});`;
        optionElem.setAttribute("value", i);
        optionElem.innerHTML = item[1];

        itemElem.appendChild(optionElem);
    }

    const boxCountElem = document.getElementById("selectBoxCount");

    for (let i = 1; i <= 10; i++) {
        const optionElem = document.createElement("option");
        optionElem.setAttribute("value", i);
        optionElem.innerHTML = i;

        boxCountElem.appendChild(optionElem);
    }

    updatePositionSelect();

    updateTable();
    updateItemProbability();
}

function createTable(tableName) {
    const tableElem = document.getElementById(tableName);

    // Create table
    for (const item of ITEM_INFO) {
        const columnElem = document.createElement("th");
        const imgElem = document.createElement("img");

        columnElem.onclick = (e) => toggleItem(e.target);

        imgElem.src = `../Images/Items/${item[0]}`;
        imgElem.style.maxWidth = "64px";
        imgElem.style.width = "100%";
        imgElem.style.height = "100%";
        imgElem.title = item[1];

        columnElem.appendChild(imgElem);
        tableElem.rows[0].appendChild(columnElem);
    }
}

function updateTable() {
    const tableItemElem = document.getElementById("tableItem");
    const tableAvailElem = document.getElementById("tableAvail");

    const playerSelectElem = document.getElementById("selectPlayerCount");
    const playerCount = playerSelectElem.value;

    let items = structuredClone(ITEM_TABLE[playerCount]);
    let disabledItems = new Set();

    // Check what items are disabled
    for (let i = 0; i < ITEM_COUNT; i++) {
        const columnElem = tableItemElem.rows[0].cells[i + 1];

        if (columnElem.children[0].classList.contains("ITEM_DISABLED")) {
            for (let j = 0; j < items.length; j++) {
                items[j][i] = 0;
            }

            disabledItems.add(i);
        }
    }

    // Normalize probabilities
    for (let i = 0; i < items.length; i++) {
        let sum = 0;

        for (let j = 0; j < items[i].length; j++) {
            sum += items[i][j] / 100;
        }

        if (sum > 0) {
            for (let j = 0; j < items[i].length; j++) {
                items[i][j] /= sum;
            }
        }
    }

    // Find max probabilities
    let maxProbs = [];

    for (let i = 0; i < ITEM_COUNT; i++) {
        let maxProb = 0;

        for (let j = 0; j < items.length; j++) {
            const itemPerc = items[j][i];

            if (itemPerc >= maxProb) {
                maxProb = itemPerc;
            }
        }

        maxProbs.push(maxProb);
    }

    // Delete old rows
    while (tableItemElem.rows.length > 1) {
        tableItemElem.deleteRow(-1);
    }

    while (tableAvailElem.rows.length > 1) {
        tableAvailElem.deleteRow(-1);
    }

    // Create item table
    for (let i = 0; i < items.length; i++) {
        const rowElem = document.createElement("tr");
        tableItemElem.appendChild(rowElem);

        const posElem = document.createElement("td");   
        rowElem.appendChild(posElem);

        posElem.innerHTML = (i + 1).toString();
        posElem.style.textAlign = "right";

        for (let j = 0; j < items[i].length; j++) {
            const itemElem = document.createElement("td");
            rowElem.appendChild(itemElem);

            if (disabledItems.has(j)) {
                itemElem.style.backgroundColor = "black";
            }
            else {
                const itemPerc = roundDecimals(items[i][j], 1);

                itemElem.innerHTML = `${itemPerc}%`;
                itemElem.style.textAlign = "right";

                if (itemPerc > 0) {
                    const COLOR_LOW = [255, 255, 255];
                    const COLOR_HIGH = [200, 0, 0];

                    const interpolation = itemPerc / maxProbs[j];
                    const color = [
                        Math.round(COLOR_LOW[0] * (1 - interpolation) + COLOR_HIGH[0] * interpolation),
                        Math.round(COLOR_LOW[1] * (1 - interpolation) + COLOR_HIGH[1] * interpolation),
                        Math.round(COLOR_LOW[2] * (1 - interpolation) + COLOR_HIGH[2] * interpolation)
                        ];
                    const colorStr = `#${color[0].toString(16).padStart(2, "0")}${color[1].toString(16).padStart(2, "0")}${color[2].toString(16).padStart(2, "0")}`;
                    itemElem.style.backgroundColor = colorStr;
                }
            }
        }
    }

    // Create availability table
    for (let i = 0; i < ITEM_AVAILABILITY.length; i++) {
        const rowElem = document.createElement("tr");
        tableAvailElem.appendChild(rowElem);

        const typeElem = document.createElement("td");
        rowElem.appendChild(typeElem);
        
        typeElem.innerHTML = ITEM_AVAILABILITY[i][0];

        for (let j = 0; j < ITEM_COUNT; j++) {
            const itemElem = document.createElement("td");
            rowElem.appendChild(itemElem);
            
            itemElem.style.textAlign = "right";

            if (ITEM_AVAILABILITY[i][1][j] != null) {
                itemElem.innerHTML = ITEM_AVAILABILITY[i][1][j].toString();
            }
        }
    }
    
    updateItemProbability();
}

function updatePositionSelect() {
    const positionCount = document.getElementById("selectPosition");
    const playerCount = document.getElementById("selectPlayerCount");
    
    while (positionCount.children.length > 0) {
        positionCount.children[0].remove();
    }

    for (let i = 1; i <= playerCount.value; i++) {
        const optionElem = document.createElement("option");
        optionElem.setAttribute("value", i);
        optionElem.innerHTML = i;

        positionCount.appendChild(optionElem);
    }
}

function updateItemProbability() {
    const item = parseInt(document.getElementById("selectItem").value);
    const boxCount = document.getElementById("selectBoxCount").value;
    const position = parseInt(document.getElementById("selectPosition").value) - 1;
    
    const itemProb = getItemProbability(item, position);
    let prob = 0;

    for (let i = 0; i < boxCount; i++) {
        prob += itemProb * Math.pow(1 - itemProb, i);
    }

    const tbProb = document.getElementById("tbItemProbability");
    tbProb.value = `${roundDecimals(prob * 100, 1)}%`;
}

function toggleItem(elem) {
    if (elem.classList.contains("ITEM_DISABLED")) {
        elem.classList.remove("ITEM_DISABLED");
    }
    else {
        elem.classList.add("ITEM_DISABLED");
    }

    updateTable();
}

function getItemProbability(item, position) {
    const tableItem = document.getElementById("tableItem");
    let itemProbStr = tableItem.rows[1 + position].cells[1 + item].innerHTML;
    
    if (itemProbStr == "") {
        itemProbStr = "0";
    }
    else if (itemProbStr.endsWith("%")) {
        itemProbStr = itemProbStr.substring(0, itemProbStr.length - 1); 
    }
    
    return parseInt(itemProbStr) / 100;
}

const ITEM_COUNT = 19;

const ITEM_TABLE = {
    2: [
        [32.5,  0, 37.5,  20,    0, 0, 0,   0, 0, 0, 0,   0, 0, 0,   0, 0,  0,  0,  10],
        [ 7.5, 20,  2.5, 2.5, 22.5, 5, 5, 2.5, 0, 0, 0, 2.5, 0, 0, 7.5, 0, 10, 10, 2.5]
    ],
    3: [
        [32.5,  0, 37.5,   20,       0,  0,   0,   0, 0, 0,   0,  0,   0, 0,   0, 0,  0,  0, 10],
        [  15, 25,  7.5,    5,    17.5,  0, 2.5,   0, 0, 0,   0,  0,   0, 0, 2.5, 0, 10,  5, 10],
        [   0, 10,     0,   0,    12.5, 15, 7.5, 7.5, 0, 0, 2.5, 10, 7.5, 5, 7.5, 0,  5, 10,  0]
    ],
    4: [
        [32.5,  0, 37.5, 20,    0,    0,   0,   0, 0,  0,    0,  0,   0, 0,   0,   0,  0,  0, 10],
        [  15, 25,  7.5,  5, 17.5,    0, 2.5,   0, 0,  0,    0,  0,   0, 0, 2.5,   0, 10,  5, 10],
        [   0, 10,    0,  0, 12.5,   15, 7.5, 7.5, 0,  0,  2.5, 10, 7.5, 5, 7.5,   0,  5, 10,  0],
        [   0,  0,    0,  0,    0, 37.5,   0, 2.5, 0, 20, 27.5,  0,   5, 5,   0, 2.5,  0,  0,  0]
    ],
    5: [
        [32.5,  0, 37.5, 20,    0,  0,   0,   0, 0,    0,  0,   0,   0,   0,   0,   0,   0,   0, 10],
        [  15, 25,  7.5,  5, 17.5,  0, 2.5,   0, 0,    0,  0,   0,   0,   0, 2.5,   0,  10,   5, 10],
        [   5, 15,    0,  0,   15, 10, 7.5,   5, 0,    0,  0, 7.5,   5,   5, 7.5,   0, 7.5,  10,  0],
        [   0,  5,    0,  0,   10, 25,   5, 7.5, 0,    0, 10, 7.5, 7.5, 7.5,   5,   0, 2.5, 7.5,  0],
        [   0,  0,    0,  0,    0, 30,   0,   0, 0, 27.5, 35,   0,   0,   0,   0, 7.5,   0,   0,  0]
    ],
    6: [
        [32.5,  0, 37.5, 20,    0,    0,   0,   0,   0,    0,    0,   0,   0,   0,   0,    0,   0,   0, 10],
        [  15, 25,  7.5,  5, 17.5,    0, 2.5,   0,   0,    0,    0,   0,   0,   0, 2.5,    0,  10,   5, 10],
        [   5, 15,    0,  0,   15,   10, 7.5,   5,   0,    0,    0, 7.5,   5,   5, 7.5,    0, 7.5,  10,  0],
        [   0,  5,    0,  0,   10,   25,   5, 7.5,   0,    0,   10, 7.5, 7.5, 7.5,   5,    0, 2.5, 7.5,  0],
        [   0,  0,    0,  0,    0, 37.5,   0, 2.5,   0,   20, 27.5,   0,   5,   5,   0,  2.5,   0,   0,  0],
        [   0,  0,    0,  0,    0, 12.5,   0,   0, 7.5, 27.5,   30,   0,   0,   0,   0, 22.5,   0,   0,  0]
    ],
    7: [
        [32.5,  0, 37.5, 20,    0,    0,   0,   0,  0,    0,    0,   0,   0,   0,   0,   0,   0,   0, 10],
        [  15, 25,  7.5,  5, 17.5,    0, 2.5,   0,  0,    0,    0,   0,   0,   0, 2.5,   0,  10,   5, 10],
        [   5, 15,    0,  0,   15,   10, 7.5,   5,  0,    0,    0, 7.5,   5,   5, 7.5,   0, 7.5,  10,  0],
        [   0,  5,    0,  0,   10,   25,   5, 7.5,  0,    0,   10, 7.5, 7.5, 7.5,   5,   0, 2.5, 7.5,  0],
        [   0,  0,    0,  0,    0, 37.5,   0, 2.5,  0,   20, 27.5,   0,   5,   5,   0, 2.5,   0,   0,  0],
        [   0,  0,    0,  0,    0,   30,   0,   0,  0, 27.5,   35,   0,   0,   0,   0, 7.5,   0,   0,  0],
        [   0,  0,    0,  0,    0,    5,   0,   0, 20, 17.5, 22.5,   0,   0,   0,   0,  35,   0,   0,  0]
    ],
    8: [
        [32.5,  0, 37.5,  20,    0,    0,   0,   0,  0,    0,    0,   0,   0,   0,   0,   0,   0,   0,   10],
        [17.5, 25,   20, 7.5, 12.5,    0,   0,   0,  0,    0,    0,   0,   0,   0,   0,   0,   5,   0, 12.5],
        [ 7.5, 20,  2.5, 2.5, 22.5,    5,   5, 2.5,  0,    0,    0, 2.5,   0,   0, 7.5,   0,  10,  10,  2.5],
        [   0, 10,    0,   0, 12.5,   15, 7.5, 7.5,  0,    0,  2.5,  10, 7.5,   5, 7.5,   0,   5,  10,    0],
        [   0,  5,    0,   0,   10,   25,   5, 7.5,  0,    0,   10, 7.5, 7.5, 7.5,   5,   0, 2.5, 7.5,    0],
        [   0,  0,    0,   0,    0, 37.5,   0, 2.5,  0,   20, 27.5,   0,   5,   5,   0, 2.5,   0,   0,    0],
        [   0,  0,    0,   0,    0,   30,   0,   0,  0, 27.5,   35,   0,   0,   0,   0, 7.5,   0,   0,    0],
        [   0,  0,    0,   0,    0,    5,   0,   0, 20, 17.5, 22.5,   0,   0,   0,   0,  35,   0,   0,    0]
    ],   
    9: [
        [32.5,   0, 37.5,  20,    0,    0,   0,   0,   0,    0,    0,   0,   0,   0,   0,    0,   0,   0,   10],
        [17.5,  25,   20, 7.5, 12.5,    0,   0,   0,   0,    0,    0,   0,   0,   0,   0,    0,   5,   0, 12.5],
        [ 7.5,  20,  2.5, 2.5, 22.5,    5,   5, 2.5,   0,    0,    0, 2.5,   0,   0, 7.5,    0,  10,  10,  2.5],
        [   5,  15,    0,   0,   15,   10, 7.5,   5,   0,    0,    0, 7.5,   5,   5, 7.5,    0, 7.5,  10,    0],
        [   0,   5,    0,   0,   10,   25,   5, 7.5,   0,    0,   10, 7.5, 7.5, 7.5,   5,    0, 2.5, 7.5,    0],
        [   0, 2.5,    0,   0,    0, 32.5,   0,   5,   0, 12.5, 22.5,   5,   5,   5,   5,    0,   0,   5,    0],
        [   0,   0,    0,   0,    0, 37.5,   0, 2.5,   0,   20, 27.5,   0,   5,   5,   0,  2.5,   0,   0,    0],
        [   0,   0,    0,   0,    0, 12.5,   0,   0, 7.5, 27.5,   30,   0,   0,   0,   0, 22.5,   0,   0,    0],
        [   0,   0,    0,   0,    0,    5,   0,   0,  20, 17.5, 22.5,   0,   0,   0,   0,   35,   0,   0,    0]
    ],
    10: [
        [32.5,   0, 37.5,  20,    0,    0,   0,   0,   0,    0,    0,   0,   0,   0,   0,    0,   0,   0,   10],
        [17.5,  25,   20, 7.5, 12.5,    0,   0,   0,   0,    0,    0,   0,   0,   0,   0,    0,   5,   0, 12.5],
        [  15,  25,  7.5,   5, 17.5,    0, 2.5,   0,   0,    0,    0,   0,   0,   0, 2.5,    0,  10,   5,   10],
        [   5,  15,    0,   0,   15,   10, 7.5,   5,   0,    0,    0, 7.5,   5,   5, 7.5,    0, 7.5,  10,    0],
        [   0,  10,    0,   0, 12.5,   15, 7.5, 7.5,   0,    0,  2.5,  10, 7.5,   5, 7.5,    0,   5,  10,    0],
        [   0,   5,    0,   0,   10,   25,   5, 7.5,   0,    0,   10, 7.5, 7.5, 7.5,   5,    0, 2.5, 7.5,    0],
        [   0, 2.5,    0,   0,    0, 32.5,   0,   5,   0, 12.5, 22.5,   5,   5,   5,   5,    0,   0,   5,    0],
        [   0,   0,    0,   0,    0,   30,   0,   0,   0, 27.5,   35,   0,   0,   0,   0,  7.5,   0,   0,    0],
        [   0,   0,    0,   0,    0, 12.5,   0,   0, 7.5, 27.5,   30,   0,   0,   0,   0, 22.5,   0,   0,    0],
        [   0,   0,    0,   0,    0,    5,   0,   0,  20, 17.5, 22.5,   0,   0,   0,   0,   35,   0,   0,    0]
    ],
    11: [
        [32.5,   0, 37.5,  20,    0,    0,   0,   0,   0,    0,    0,   0,   0,   0,   0,    0,   0,   0,   10],
        [17.5,  25,   20, 7.5, 12.5,    0,   0,   0,   0,    0,    0,   0,   0,   0,   0,    0,   5,   0, 12.5],
        [  15,  25,  7.5,   5, 17.5,    0, 2.5,   0,   0,    0,    0,   0,   0,   0, 2.5,    0,  10,   5,   10],
        [ 7.5,  20,  2.5, 2.5, 22.5,    5,   5, 2.5,   0,    0,    0, 2.5,   0,   0, 7.5,    0,  10,  10,  2.5],
        [   5,  15,    0,   0,   15,   10, 7.5,   5,   0,    0,    0, 7.5,   5,   5, 7.5,    0, 7.5,  10,    0],
        [   0,   5,    0,   0,   10,   25,   5, 7.5,   0,    0,   10, 7.5, 7.5, 7.5,   5,    0, 2.5, 7.5,    0],
        [   0, 2.5,    0,   0,    0, 32.5,   0,   5,   0, 12.5, 22.5,   5,   5,   5,   5,    0,   0,   5,    0],
        [   0,   0,    0,   0,    0, 37.5,   0, 2.5,   0,   20, 27.5,   0,   5,   5,   0,  2.5,   0,   0,    0],
        [   0,   0,    0,   0,    0,   30,   0,   0,   0, 27.5,   35,   0,   0,   0,   0,  7.5,   0,   0,    0],
        [   0,   0,    0,   0,    0, 12.5,   0,   0, 7.5, 27.5,   30,   0,   0,   0,   0, 22.5,   0,   0,    0],
        [   0,   0,    0,   0,    0,    5,   0,   0,  20, 17.5, 22.5,   0,   0,   0,   0,   35,   0,   0,    0]
    ],
    12: [
        [32.5,   0, 37.5,  20,    0,    0,   0,   0,   0,    0,    0,   0,   0,   0,   0,    0,   0,   0,   10],
        [17.5,  25,   20, 7.5, 12.5,    0,   0,   0,   0,    0,    0,   0,   0,   0,   0,    0,   5,   0, 12.5],
        [  15,  25,  7.5,   5, 17.5,    0, 2.5,   0,   0,    0,    0,   0,   0,   0, 2.5,    0,  10,   5,   10],
        [ 7.5,  20,  2.5, 2.5, 22.5,    5,   5, 2.5,   0,    0,    0, 2.5,   0,   0, 7.5,    0,  10,  10,  2.5],
        [   5,  15,    0,   0,   15,   10, 7.5,   5,   0,    0,    0, 7.5,   5,   5, 7.5,    0, 7.5,  10,    0],
        [   0,  10,    0,   0, 12.5,   15, 7.5, 7.5,   0,    0,  2.5,  10, 7.5,   5, 7.5,    0,   5,  10,    0],
        [   0,   5,    0,   0,   10,   25,   5, 7.5,   0,    0,   10, 7.5, 7.5, 7.5,   5,    0, 2.5, 7.5,    0],
        [   0, 2.5,    0,   0,    0, 32.5,   0,   5,   0, 12.5, 22.5,   5,   5,   5,   5,    0,   0,   5,    0],
        [   0,   0,    0,   0,    0, 37.5,   0, 2.5,   0,   20, 27.5,   0,   5,   5,   0,  2.5,   0,   0,    0],
        [   0,   0,    0,   0,    0,   30,   0,   0,   0, 27.5,   35,   0,   0,   0,   0,  7.5,   0,   0,    0],
        [   0,   0,    0,   0,    0, 12.5,   0,   0, 7.5, 27.5,   30,   0,   0,   0,   0, 22.5,   0,   0,    0],
        [   0,   0,    0,   0,    0,    5,   0,   0,  20, 17.5, 22.5,   0,   0,   0,   0,   35,   0,   0,    0]
    ]
};

const ITEM_AVAILABILITY = [
    ["Max",             [  12,    8,   16,    6,   12, null,    3,    1,  1,    3,    2,    2,  1,  1,    1,    1, null, null, null]],
    ["First Available", [null, null, null, null, null, null, null,   30, 30, null, null, null, 15, 20, null, null, null, null, null]],
    ["Cooldown",        [null, null, null, null, null, null, null, null, 30, null, null, null, 15, 20, null, null, null, null, null]]    
];

const ITEM_INFO = [
    ["Green.png",     "Green Shell"],
    ["Red.png",       "Red Shell"],
    ["Banana.png",    "Banana"],
    ["Fib.png",       "Fake Item Box"],
    ["Mushroom.png",  "Mushroom"],
    ["Mushroom3.png", "Triple Mushrooms"],
    ["Bomb.png",      "Bob-omb"],
    ["Blue.png",      "Blue Shell"],
    ["Lighting.png",  "Lighting"],
    ["Star.png",      "Star"],
    ["Golden.png",    "Golden Mushroom"],
    ["Mega.png",      "Mega Mushroom"],
    ["Blooper.png",   "Blooper"],
    ["Pow.png",       "POW Block"],
    ["Tc.png",        "Thunder Cloud"],
    ["Bill.png",      "Bullet Bill"],
    ["Green3.png",    "Triple Green Shells"],
    ["Red3.png",      "Triple Red Shells"],
    ["Banana3.png",   "Triple Bananas"]
];
