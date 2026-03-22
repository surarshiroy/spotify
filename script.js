console.log("Hello Everyone. This is Surarshi Roy");

// --- 1. GLOBAL VARIABLES ---
let currentsong = new Audio();
let songs = [];       // Keeps track of the current album's song list
let currFolder = "";  // Keeps track of which folder is currently open

// --- 2. FETCH SONGS LOGIC ---
async function getsongs(folder) {
    currFolder = folder; 
    
    try {
        // Fetch the JSON file from the specific folder
        let a = await fetch(`/${folder}/info.json`);
        
        // Parse the JSON data
        let data = await a.json();
        
        // Update our global songs array
        songs = data.songs; 
        
        return songs;
    } catch (error) {
        console.error("Could not load songs for this album:", error);
        return [];
    }
}

// --- 3. TIME FORMATTER ---
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
}

// --- 4. PLAY MUSIC LOGIC ---
// Notice we don't need 'folder' as an argument anymore; we use the global currFolder!
const playmusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentsong.play();
        play.src = "pause.svg";
    }

    let displayName = decodeURI(track)
        .replace(".mp3", "")
        .replace(/320\s*Kbps/gi, "")
        .replace(/\(.*\.(com|se|net).*\)/gi, "")
        .replace(/\s+/g, ' ')
        .trim();

    document.querySelector(".songinfo").innerHTML = displayName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// --- 5. RENDER THE ALBUM SIDEBAR ---
async function displaySongs(folder) {
    await getsongs(`songs/${folder}`); // This updates the global 'songs' array
    
    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = ""; // Wipe the old list from the screen

    for (const song of songs) {
        // Clean up the names for the UI
        let cleanName = song.replace(".mp3", "")
            .replace(/320\s*Kbps/gi, "")
            .replace(/\(.*\.(com|se|net).*\)/gi, "")
            .replace(/\s+/g, ' ')
            .trim();

        let songName = cleanName;
        let songArtist = "Unknown Artist";

        if (cleanName.includes("-")) {
            let parts = cleanName.split("-");
            songArtist = parts[0].trim();
            songName = parts[1].trim();
        }

        // Add to the HTML list
        songul.innerHTML += `<li data-filename="${song}">
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${songName}</div>
                <div>${songArtist}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach click listeners to the newly created list items
    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", () => {
            playmusic(e.getAttribute("data-filename"));
        });
    });
}

// --- 6. MAIN INITIALIZATION ---
async function main() {
    // 1. Load the first folder by default
    await displaySongs("happy hits"); 
    playmusic(songs[0], true); // Load the first song but keep it paused

    // 2. Add click events to ALBUM CARDS
    Array.from(document.querySelectorAll(".card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folder = item.currentTarget.dataset.folder;
            await displaySongs(folder); 
            playmusic(songs[0]); // Auto-play the first song of the new album
        });
    });

    // 3. Play/Pause Button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg";
        } else {
            currentsong.pause();
            play.src = "play.svg";
        }
    });

    // 4. Seekbar Updates
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `
            ${secondsToMinutesSeconds(currentsong.currentTime)} / 
            ${secondsToMinutesSeconds(currentsong.duration)}
        `;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    // 5. Hamburger & Close Buttons (Mobile)
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%";
    });

    // 6. Previous & Next Buttons
    previous.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(decodeURI(currentsong.src.split("/").slice(-1)[0]));
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(decodeURI(currentsong.src.split("/").slice(-1)[0]));
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    // 7. Volume Slider
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
        if (currentsong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    });
}

main();