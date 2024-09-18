var MasterPlay = document.querySelector(".now");
var MasterNext = document.querySelector(".next");
var MasterBack = document.querySelector(".back");
var ProgressBar = document.querySelector("#Progressbar");
var song = 0; // Index of the current song
var Svgs = document.getElementsByTagName("svg");
var songItems = document.querySelectorAll(".songItem");
var audio = new Audio(); // Initialize audio without a source yet
var currentActive = null; // To keep track of the currently active (paused) button
var totalSongs = Svgs.length;

// Helper functions to set Play and Pause states
function setPlay(svg) {
  svg.innerHTML = `
    <path d="M6 3.278v9.444L12.5 8 6 3.278z" />
  `;
  svg.clickState = false;
  audio.pause(); // Pause the audio when switching to play state
  MasterPlay.setAttribute("src", "./play.svg");
}

function setPause(svg) {
  svg.innerHTML = `
  <rect x="4" y="3" width="2" height="8" rx="1" />
  <rect x="10" y="3" width="2" height="8" rx="1" />
  `;
  svg.clickState = true;
  audio.play(); // Play the audio when switching to pause state
  MasterPlay.setAttribute("src", "./pause.svg");
}

// Helper function to format time (mm:ss)
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${minutes}:${sec < 10 ? "0" : ""}${sec}`;
}

// Update the song timestamp display
function updateTimestamp() {
  const currentTime = formatTime(audio.currentTime);
  const totalTime = formatTime(audio.duration || 0);
  const timestampElem = songItems[song].querySelector(".timestamp");
  timestampElem.innerHTML = `${currentTime} / ${totalTime}`;
}

// Loop to set up event listeners for each song icon
for (var i = 0; i < Svgs.length; i++) {
  Svgs[i].clickState = false; // Initialize click state for each SVG

  // Create a closure around `i` to capture the correct index for each SVG button
  Svgs[i].addEventListener('click', (function(i) {
    return function() {
      audio.src = `./Song${i + 1}.mp3`; // Set the correct audio file
      song = i; // Track the current song index
      resetTimestamps(); // Reset all timestamps
      if (this.clickState) {
        setPlay(this); // Reset to play
        currentActive = null;
      } else {
        if (currentActive) {
          setPlay(currentActive); // Reset the previously active button
        }
        setPause(this); // Set the clicked button to pause
        currentActive = this;
        updateTimestamp(); // Update the timestamp when the song starts
      }
    };
  })(i));
}

// Reset all timestamps when switching songs
function resetTimestamps() {
  songItems.forEach(item => {
    const timestampElem = item.querySelector(".timestamp");
    timestampElem.innerHTML = "00:00 / --:--";
  });
}

// Master Play/Pause button control
MasterPlay.addEventListener('click', function() {
  if (audio.paused || audio.currentTime <= 0) {
    audio.play();
    MasterPlay.setAttribute("src", "./pause.svg");
    updateTimestamp();
  } else {
    audio.pause();
    MasterPlay.setAttribute("src", "./play.svg");
  }
});

// Update progress bar and timestamp dynamically
audio.addEventListener('timeupdate', function() {
  const progress = parseInt((audio.currentTime / audio.duration) * 100);
  ProgressBar.value = progress;
  updateTimestamp(); // Update the timestamp every time the song progresses
});

// Seek in the song when progress bar is changed
ProgressBar.addEventListener('change', function() {
  audio.currentTime = (ProgressBar.value * audio.duration) / 100;
});

// Navigate to the previous song
MasterBack.addEventListener("click", function() {
  song = (song - 1 + totalSongs) % totalSongs; // Decrease the song index and wrap around if necessary
  audio.src = `./Song${song + 1}.mp3`;
  audio.play();
  resetTimestamps();
  if (currentActive) {
    setPlay(currentActive); // Reset previous button
  }
  setPause(Svgs[song]); // Set the new song's button to pause
  currentActive = Svgs[song];
  updateTimestamp(); // Update timestamp for the new song
});

// Navigate to the next song
MasterNext.addEventListener("click", function() {
  song = (song + 1) % totalSongs; // Increase the song index and wrap around if necessary
  audio.src = `./Song${song + 1}.mp3`;
  audio.play();
  resetTimestamps();
  if (currentActive) {
    setPlay(currentActive); // Reset previous button
  }
  setPause(Svgs[song]); // Set the new song's button to pause
  currentActive = Svgs[song];
  updateTimestamp(); // Update timestamp for the new song
});
