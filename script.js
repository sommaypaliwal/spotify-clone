let currentSong = new Audio()
let songs = []
let currentIndex = 0
let currentFolder = ""
currentSong.volume = 1

async function getArtists() {
    let response = await fetch("/songs/")
    let text = await response.text()

    let div = document.createElement("div")
    div.innerHTML = text
    let links = div.getElementsByTagName("a")

    let artists = []

    for (let link of links) {
        if (link.href.endsWith("/") && link.textContent.trim() !== "../") {
            artists.push(link.textContent.trim().replace("/", ""))
        }
    }

    let cardContainer = document.querySelector(".songcards")

    for (let artist of artists) {
        cardContainer.innerHTML += `<div class="card pointer">
                    <div class="playgreen"><img style="width: 45px;" src="images/play-green.svg" alt="Play"></div>
                    <img src="songs/${artist}/cover.jpg" alt="${artist}">
                    <h2>${artist}</h2>
                    </div>`
    }

    let cards = document.querySelectorAll(".card")
    cards.forEach((card, index) => {
        card.addEventListener("click", () => {
            let artist = artists[index]
            getSongs(artist)
        })
    });
}

async function getSongs(folder) {
    currentFolder = folder
    songs = []

    let response = await fetch(`/songs/${folder}/`)
    let text = await response.text()

    let div = document.createElement("div")
    div.innerHTML = text

    let links = div.getElementsByTagName("a")

    for (let link of links) {
        let filename = link.textContent
        if (filename.endsWith(".mp3") || filename.endsWith(".webm")) {
            songs.push(`/songs/${folder}/${filename}`)
        }
    }


    let songlist = document.querySelector(".songlist ul")
    songlist.innerHTML = ""

    for (let song of songs) {
        let tempSongName = song.split("/").pop()
        let songName = tempSongName.split(".")[0]

        songlist.innerHTML += `
            <li class="pointer">
            <div class="music invert"><img src="images/music.svg" alt="Music"></div>
            <div class="songName">${songName}</div>
            <div class="rightcorner">
                <div class="playnow">Play Now</div>
                <div class="playinlibrary invert"><img src="images/play.svg" alt="Play"></div>
            </div>
            </li>
        `
    }

    let songItems = document.querySelectorAll(".songlist li")
    let circle = document.querySelector(".volumecircle")
    let current = document.querySelector(".volumecurrent")

    songItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            playSong(index)
            currentSong.volume = 1
            circle.style.left = "100%"
            current.style.width = "100%"
            document.querySelector(".volumelogo").innerHTML = `<img style="width: 23px;" src="images/volume.svg" alt="Volume">`
        })
    });
}

function playSong(index) {
    currentIndex = index
    currentSong.src = songs[currentIndex]
    currentSong.play()
    let icon = document.querySelector(".play")
    icon.innerHTML = `<img style="width: 25px;" src="images/pause.svg" alt="Play">`

    let tempSongName = songs[index].split("/").pop()
    let songName = tempSongName.split(".")[0]

    document.querySelector(".songinfo").innerHTML = `${songName} - ${currentFolder}`


    let songItems = document.querySelectorAll(".songlist li")
    songItems.forEach(item => {
        item.classList.remove("playing")
    });

    songItems[index].classList.add("playing")
}

function playpause() {
    let icon = document.querySelector(".play")
    icon.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            icon.innerHTML = `<img style="width: 25px;" src="images/pause.svg" alt="Play">`
        }
        else {
            currentSong.pause()
            icon.innerHTML = `<img style="width: 25px;" src="images/play.svg" alt="Play">`
        }
    })

}


function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    let minutes = Math.floor(seconds / 60)
    let sec = Math.floor(seconds % 60)

    let formattedMinutes = String(minutes).padStart(2, "0")
    let formattedSeconds = String(sec).padStart(2, "0")

    return `${formattedMinutes}:${formattedSeconds}`
}

currentSong.addEventListener("loadedmetadata", () => {
    let totalDuration = document.querySelector(".totalDuration")
    totalDuration.innerHTML = secondsToMinutes(currentSong.duration)
})

currentSong.addEventListener("timeupdate", () => {
    let currentDuration = document.querySelector(".currentDuration")
    let circle = document.querySelector(".circle")
    let played = document.querySelector(".played")

    currentDuration.innerHTML = secondsToMinutes(currentSong.currentTime)

    if(!isNaN(currentSong.duration) && currentSong.duration > 0) {
    let progress = (currentSong.currentTime / currentSong.duration) * 100

    circle.style.left = progress + "%"
    played.style.width = progress + "%"
}
})

document.querySelector(".next").addEventListener("click", () => {
    if (songs.length === 0) return
    
    if (currentIndex < songs.length - 1) {
        playSong(currentIndex + 1)
    }
    else {
        playSong(0)
    }
})

document.querySelector(".previous").addEventListener("click", () => {
    if (songs.length === 0) return
    
    if (currentIndex > 0) {
        playSong(currentIndex - 1)
    }
    else {
        playSong(currentIndex)
    }
})

currentSong.addEventListener("ended", () => {
    if (songs.length === 0) return

    if (currentIndex < songs.length - 1) {
        playSong(currentIndex + 1)
    }
    else {
        playSong(0)
    }
})

document.querySelector(".songtimebar").addEventListener("click", (e) => {
    let bar = e.currentTarget

    let clickPosition = e.offsetX
    let barWidth = bar.offsetWidth

    let percentage = clickPosition / barWidth

    currentSong.currentTime = percentage * currentSong.duration
})

function muteUnmute() {

    let slider = document.querySelector(".volumeslider")
    let circle = document.querySelector(".volumecircle")
    let current = document.querySelector(".volumecurrent")
    let icon = document.querySelector(".volumelogo")

    slider.addEventListener("click", (e) => {

        let clickPosition = e.offsetX
        let barWidth = slider.offsetWidth

        let currentVolume = clickPosition / barWidth

        currentSong.volume = currentVolume

        circle.style.left = (currentVolume * 100) + "%"
        current.style.width = (currentVolume * 100) + "%"

        if (currentVolume === 0) {
            icon.innerHTML = `<img style="width: 23px;" src="images/mute.svg" alt="Mute">`
        }
        else {
            icon.innerHTML = `<img style="width: 23px;" src="images/volume.svg" alt="Volume">`
        }
    })


    icon.addEventListener("click", () => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0
            circle.style.left = "0%"
            current.style.width = "0%"

            icon.innerHTML = `<img style="width: 23px;" src="images/mute.svg" alt="Mute">`
        }
        else {
            currentSong.volume = 1
            circle.style.left = "100%"
            current.style.width = "100%"

            icon.innerHTML = `<img style="width: 23px;" src="images/volume.svg" alt="Volume">`
        }
    })
}

let hamburger = document.querySelector(".hamburger")
let close = document.querySelector(".close")
let left = document.querySelector(".left")

hamburger.addEventListener("click", () => {
    left.classList.add("active")
})

close.addEventListener("click", () => {
    left.classList.remove("active")
})

async function main() {
    await getArtists()
    playpause()
    muteUnmute()
}

main()