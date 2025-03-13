function $(id){
    return document.getElementById(id);
}

function formatPresetName(str) {
    return str
        .split('-')                      // Split by "-"
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' ');                      // Join words with a space
}

async function fetchData(path) {
    let data = null;
    try {
        const response = await fetch(`https://sotnrandoapi.duckdns.org${path}`);
        if (!response.ok) {
            console.log(`Error reaching path ${path}.`)
        }
        data = await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
    return data;
}

async function getPlayerElo(playerName, preset){
    const playerData = await fetchData(`/user/${playerName}`);
    let eloData = null;
    playerData["ranked_elos"].forEach((elo) => {
        if(elo["preset"] === preset){
            eloData = elo;
        }
    })
    return eloData;
}

async function getEloChange(playerName, preset){
    const matchesData = await fetchData(`/player_match_history/${playerName}?number_of_matches=5&preset=${preset}`);
    let rankChange = 0;
    matchesData["match_history"].forEach((match) => {
        rankChange += match["elo_change"];
    })
    return rankChange;
}


async function loadListener(){
    console.log("Loading...")
    const params = new URLSearchParams(window.location.search);
    const playerName = params.get("playerName");
    const customName = params.get("customName");
    const preset = params.get("preset");
    const transparency = params.get("transparency") === "yes";
    // Set player Name
    $("playerName").innerText = customName;
    // Set Transparency
    if(transparency){
        $("card").classList.add("transparent");
    }else{
        $("card").classList.add("white");
    }
    // Set player elo
    const elo = await getPlayerElo(playerName, preset);
    $("rank").innerText = `#${elo["rank"]} `;
    $("elo").innerText = `${elo["elo"]} ELO`;
    // Set Last 5 Elo Change
    let eloChange = await getEloChange(playerName, preset);
    if(eloChange > 0){
        eloChange = `+${eloChange}`
        $("lastTotalValue").classList.add("positive-total");
    }else if(eloChange < 0){
        $("lastTotalValue").classList.add("negative-total");
    }
    $("lastTotalValue").innerText = `${eloChange}`;
    // Set Preset Name
    $("presetName").innerText = formatPresetName(preset);
    // Set Total Matches
    $("totalMatches").innerText = `Total Matches: ${elo["matches"]}`;
}

window.addEventListener('load', loadListener);