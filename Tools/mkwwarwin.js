function updateTable() {
    const tableSpots = document.getElementById("tableSpots");
    const inputScore = document.getElementById("inputScore");

    // Delete old rows
    while (tableSpots.rows.length > 1) {
        tableSpots.deleteRow(-1);
    }

    // Parse input
    const losingBy = parseInt(inputScore.value);

    if (isNaN(losingBy)) {
        return;
    }

    const raceSpots = calculateSpots(losingBy)
    const winSpots = raceSpots[0];
    const loseSpots = raceSpots[1];
    winSpots.sort((a, b) => a[1] - b[1]);
    loseSpots.sort((a, b) => b[1] - a[1]);

    const loseSpotsCountToShow = Math.min(5, loseSpots.length);
    loseSpotsToShow = loseSpots.slice(0, loseSpotsCountToShow);
    loseSpotsToShow.sort((a, b) => a[1] - b[1]);

    for (const spots of loseSpotsToShow) {
        addSpotsTableRow(tableSpots, spots, losingBy);
    }

    for (const spots of winSpots) {
        addSpotsTableRow(tableSpots, spots, losingBy);
    }
}

function addSpotsTableRow(tableSpots, spots, losingBy) {
    const spotsArray = spots[0];
    const score = spots[1];

    const spotsStr = spotsArray.join(" ");
    const scoreStr = score > 0 ? "+" + score.toString() : score.toString();

    const rowElem = document.createElement("tr");
    tableSpots.appendChild(rowElem);

    // Spots
    const spotsElem = document.createElement("td");
    spotsElem.innerHTML = spotsStr;
    rowElem.appendChild(spotsElem);

    // Score
    const scoreElem = document.createElement("td");
    scoreElem.innerHTML = scoreStr;
    scoreElem.style.textAlign = "right";
    rowElem.appendChild(scoreElem);

    // Win?
    const winElem = document.createElement("td");
    let winStr = undefined;
    let winColor = undefined;

    if (score > losingBy) {
        winStr = "Win!";
        winColor = "green";
    }
    else if (score < losingBy) {
        winStr = "Lose!";
        winColor = "red";
    }
    else {
        winStr = "Tie";
        winColor = "gray";
    }

    winElem.innerHTML = winStr;
    winElem.style.backgroundColor = winColor;
    rowElem.appendChild(winElem);
}

function calculateSpots(losingBy) {
    const runnerSpots = getCombinations(POSSIBLE_RUNNER_SPOTS, 4);
    const baggerSpot = getCombinations(POSSIBLE_BAGGER_SPOTS, 1);

    let winOrTieSpots = []
    let loseSpots = []

    for (const runnerRaceSpots of runnerSpots) {
        const runnerTeamScore = runnerRaceSpots.map(x => getScore(x)).reduce((acc, val) => acc + val, 0);

        for (const baggerRaceSpot of baggerSpot) {
            const baggerTeamScore = getScore(baggerRaceSpot);
            const teamScore = runnerTeamScore + baggerTeamScore;
            const otherTeamScore = TOTAL_RACE_POINTS - teamScore;
            var winRaceBy = teamScore - otherTeamScore;
            
            raceSpots = [...runnerRaceSpots, ...baggerRaceSpot]
            
            if (winRaceBy >= losingBy) {
                winOrTieSpots.push([raceSpots, winRaceBy])
            }
            else {
                loseSpots.push([raceSpots, winRaceBy])
            }
        }
    }

    return [winOrTieSpots, loseSpots];
}

function getCombinations(arr, k, start = 0, curr = [], result = []) {
    if (curr.length === k) {
        result.push([...curr]); // Store the current combination
        return;
    }

    for (let i = start; i < arr.length; i++) {
        curr.push(arr[i]); // Include current element
        getCombinations(arr, k, i + 1, curr, result); // Recursive call
        curr.pop(); // Backtrack
    }

    return result;
}

function getScore(spot) {
    const index = spot - 1;
    return PLAYER_10_SCORES[index];
}

const POSSIBLE_RUNNER_SPOTS = [1, 2, 3, 4, 5, 6, 7, 8];
const POSSIBLE_BAGGER_SPOTS = [9, 10]

PLAYER_10_SCORES = [
    15,
    12,
    10,
    8,
    6,
    4,
    3,
    2,
    1,
    0
]

const TOTAL_RACE_POINTS = PLAYER_10_SCORES.reduce((acc, val) => acc + val, 0);
