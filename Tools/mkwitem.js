function initTable() {
    const tableElem = document.getElementById("tableItem");

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

    // Player count options
    const playerSelectElem = document.getElementById("selectPlayerCount");

    for (const playerCount in ITEM_TABLE) {
        const playerElem = document.createElement("option");
        playerElem.setAttribute("value", playerCount);
        playerElem.innerHTML = playerCount;

        playerSelectElem.appendChild(playerElem);
    }

    playerSelectElem.value = 10;

    updateTable();
}

function updateTable() {
    const tableElem = document.getElementById("tableItem");

    const playerSelectElem = document.getElementById("selectPlayerCount");
    const playerCount = playerSelectElem.value;

    let items = structuredClone(ITEM_TABLE[playerCount]);
    let disabledItems = new Set();

    // Check what items are disabled
    for (let i = 0; i < ITEM_COUNT; i++) {
        const columnElem = tableElem.rows[0].cells[i + 1];

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
    while (tableElem.rows.length > 1) {
        tableElem.deleteRow(-1);
    }

    // Create table
    for (let i = 0; i < items.length; i++) {
        const rowElem = document.createElement("tr");
        tableElem.appendChild(rowElem);

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
                const itemPerc = Math.round(items[i][j] * 10) / 10;

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
    ["Pow.png",       "POW"],
    ["Tc.png",        "Thunder Cloud"],
    ["Bill.png",      "Bullet Bill"],
    ["Green3.png",    "Triple Green Shells"],
    ["Red3.png",      "Triple Red Shells"],
    ["Banana3.png",   "Triple Bananas"]
];
