console.log("Lets write Javascript");
let currentsong = new Audio();
let index;
let currFolder;
let songs;
// function convertSecondsToMinutesAndSeconds(seconds) {
//     var minutes = Math.floor(seconds / 60);
//     var remainingSeconds = seconds % 60;

//     // Use template literals for formatting with leading zeros
//     var formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
//     var formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

//     return `${formattedMinutes}:${formattedSeconds}`;
// }
function convertSecondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Example usage:
// var totalSeconds = 12;
// var result = convertSecondsToMinutesAndSeconds(totalSeconds);
// console.log(`${totalSeconds} seconds is equal to ${result} minutes:seconds`);



async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://192.168.0.111:3000/${folder}/`)
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }




    // show all the song in the playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]

    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML +
            `<li><img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                            <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Jutt Sb</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`

    }



    // Attach an eventlistener to each songs
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })

    });







    return songs;

}


const playmusic = (track, pause = false) => {
    // let audio = new Audio("/songs/"+track)
    currentsong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg"
    }


    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    console.log("displaying albums")

    let a = await fetch(`http://192.168.0.111:3000/songs`)
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardsContainer = document.querySelector(".cardscontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            // console.log(e.href);
            // console.log(folder);
            // get metadata of thr folder
            let a = await fetch(`http://192.168.0.111:3000/songs/${folder}/info.json`)

            let response = await a.json();
            console.log(response);
            cardsContainer.innerHTML = cardsContainer.innerHTML + `<div  data-folder="${folder}" class="card">
            <div class="play">
                <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"> 
                    <!-- Green Circle -->
                    <circle cx="30" cy="30" r="25" fill="#1ed760" />

                    <!-- Play Button -->
                    <polygon points="23,18 23,42 40,30" fill="#000" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="img">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`

        }
    }

    // Load the library whenever card is Clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.currentTarget.dataset.folder);

            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0])
        }
        )

    });
}



async function main() {





    // get list of all the songs
    songs = await getsongs("songs/Ncs");
    // console.log(songs);

    playmusic(songs[2], true)


    // display the Albums 
    displayAlbums();

    // Attach an eventlistener to previous play , next in playbar
    play.addEventListener("click", (e) => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause();
            play.src = "img/play.svg"
        }
    }
    )
    //listenn for timeupdate Event

    currentsong.addEventListener("timeupdate", (element) => {
        // console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutesAndSeconds(currentsong.currentTime)}/${convertSecondsToMinutesAndSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    }
    )

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        // console.log(percent);

        document.querySelector(".circle").style.left = percent + "%"

        currentsong.currentTime = (currentsong.duration * percent) / 100
    }
    )
    // Add an Eventlistener for Hamburger
    document.querySelector(".hamburger").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = "0";

    }
    )

    // Add an Eventlistener for Close
    document.querySelector(".close").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = "-120%";

    }
    )

    // Add an Eventlistener for pevious
    previous.addEventListener("click", (e) => {
        console.log("previous Clicked");

        // console.log(currentsong);
        // console.log(currentsong.src);
        index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        // console.log(index);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1]);
        }

    }
    )

    // Add an Eventlistener for next
    next.addEventListener("click", (e) => {
        console.log("next Clicked");
        currentsong.pause;
        // console.log(currentsong);
        // console.log(currentsong.src);
        index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        // console.log(index);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        }

    }
    )

    // Add an Eventlistener for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to ", e.target.value, "/100")
        currentsong.volume = parseInt(e.target.value) / 100
        if(currentsong.volume>0){
            document.querySelector(".timevol>img").src = document.querySelector(".timevol>img").src.replace("mute.svg","volume.svg")
        }
    }
    )

    // Add an Eventlistener to mute the track

    document.querySelector(".timevol>img").addEventListener("click",e => {
      console.log(e.target);
      if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg","mute.svg")
        currentsong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
      } else {
        e.target.src = e.target.src.replace("mute.svg","volume.svg")
        currentsong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        console.log(document.querySelector(".range").getElementsByTagName("input")[0].value = 10);
      }
    }
    )
}
main();

