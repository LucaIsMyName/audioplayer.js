/**
 * @name audioplayer.js
 * @version 1.0
 * @author luca mack
 * @description provides an api to insert an audioplayer element on a website by just adding html attributes to elements 
*/

// Function to initialize the audio player
function initializeAudioPlayer(player) {
    const controls = player.querySelector('[data-audioplayer-controls]');
    const playlist = player.querySelector('[data-audioplayer-playlist]');
    const currentTrackImage = player.querySelector('[data-audioplayer-current="cover"]');
    const currentTrackTitle = player.querySelector('[data-audioplayer-current="track"]');
    const currentArtistTitle = player.querySelector('[data-audioplayer-current="artist"]');

    const playPauseButton = controls.querySelector('[data-audioplayer-control="play-pause"]');
    const prevButton = controls.querySelector('[data-audioplayer-control="prev"]');
    const nextButton = controls.querySelector('[data-audioplayer-control="next"]');
    const repeatPlaylistButton = controls.querySelector('[data-audioplayer-control="repeat-playlist"]');
    const repeatTrackButton = controls.querySelector('[data-audioplayer-control="repeat-track"]');
    const volumeInput = controls.querySelector('[data-audioplayer-control="volume"]');
    const muteUnmuteButton = controls.querySelector('[data-audioplayer-control="mute-unmute"]');
    const progressBar = controls.querySelector('[data-audioplayer-control="progress-bar"]');

    const trackItems = Array.from(playlist.querySelectorAll('[data-audioplayer-track]'));
    // Initial Track Index = 0
    let currentTrackIndex = 0;
    // Crreate New Audio
    let audio = new Audio(); // Create a new audio element

    // Function to check if a control exists and then perform the given action
    function initializeControl(selector, action) {
        const control = controls.querySelector(selector);
        if (control) {
            action(control);
        }
    }

    // Load the Track Details & Infos into each matching data-audioplayer-current-{name} element
    function loadTrackDetails(index) {
        const trackItem = trackItems[index];
        const trackURL = trackItem.getAttribute('data-audioplayer-track-url');
        const trackImage = trackItem.querySelector('[data-audioplayer-track="cover"]');
        const trackTitle = trackItem.querySelector('[data-audioplayer-track="title"]');
        const artistTitle = trackItem.querySelector('[data-audioplayer-track="artist"]');

        audio.src = trackURL;
        if (currentTrackImage.src != false) {
            currentTrackImage.src = trackImage.src;
        }
        currentTrackTitle.textContent = trackTitle.textContent;
        currentArtistTitle.textContent = artistTitle.textContent;

        // Set initial state to paused
        playPauseButton.setAttribute('data-audioplayer-current-state', 'pause');
    }

    // Function to add click event listeners to track items
    trackItems.forEach((trackItem, index) => {
        trackItem.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrackDetails(index);
            // Set the player to the paused state
            playPauseButton.setAttribute('data-audioplayer-current-state', 'pause');
        });
    });

    function loadAndPlayTrack(index) {
        const trackItem = trackItems[index];
        // Debugging: log the track item
        // console.log('Track item:', trackItem);
        loadTrackDetails(currentTrackIndex);


        // Check if trackItem is defined
        if (!trackItem) {
            console.error('Track item is undefined. Index:', index);
            return;
        }

        const trackURL = trackItem.getAttribute('data-audioplayer-track-url'); // Corrected attribute retrieval
        const trackImage = trackItem.querySelector('[data-audioplayer-track="cover"]');
        const trackTitle = trackItem.querySelector('[data-audioplayer-track="title"]');
        const artistTitle = trackItem.querySelector('[data-audioplayer-track="artist"]');

        audio.src = trackURL;
        currentTrackImage.src = trackImage.src;
        currentTrackTitle.textContent = trackTitle.textContent;
        currentArtistTitle.textContent = artistTitle.textContent;


        // Check if audio is ready and then play
        if (audio.readyState >= 3) {
            playAudio();
        } else {
            audio.addEventListener('canplay', playAudio);
        }


    }

    function playAudio() {
        audio.play().then(() => {
            playPauseButton.setAttribute('data-audioplayer-current-state', 'play');
        }).catch(error => {
            console.error('Error trying to play the audio:', error);
        });
    }


    // Event listeners for play/pause, prev, and next buttons
    initializeControl('[data-audioplayer-control="play-pause"]', (control) => {
        control.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                control.setAttribute('data-audioplayer-current-state', 'play');
                // console.log('play button clicked');
            } else {
                audio.pause();
                control.setAttribute('data-audioplayer-current-state', 'pause');
                // console.log('pause button clicked');
            }
        });
    });
    initializeControl('[data-audioplayer-control="prev"]', (control) => {
        control.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex - 1 + trackItems.length) % trackItems.length;
            loadAndPlayTrack(currentTrackIndex);
        });
    });
    initializeControl('[data-audioplayer-control="next"]', (control) => {
        control.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex + 1) % trackItems.length;
            loadAndPlayTrack(currentTrackIndex);
        });
    });

    // Function to toggle repeat playlist
    function toggleRepeatPlaylist() {
        audio.loop = false; // Disable track looping
        repeatPlaylistButton.classList.toggle('active');
        // Logic to repeat the playlist
        audio.onended = () => {
            if (repeatPlaylistButton.classList.contains('active')) {
                currentTrackIndex = (currentTrackIndex + 1) % trackItems.length;
                loadAndPlayTrack(currentTrackIndex);
            }
        };
    }

    // Function to toggle repeat track
    function toggleRepeatTrack() {
        repeatTrackButton.setAttribute('data-audioplayer-repeat-track', 'true');
        audio.loop = repeatTrackButton.getAttribute('data-audioplayer-repeat-track').contains('active');
    }

    // Function to update volume
    function updateVolume() {
        audio.volume = volumeInput.value / 100;
    }

    // Function to toggle mute/unmute
    function toggleMuteUnmute() {
        audio.muted = !audio.muted;
        if (!audio.muted) {
            muteUnmuteButton.setAttribute('data-audioplayer-muted', 'false');
        } else {
            muteUnmuteButton.setAttribute('data-audioplayer-muted', 'true');
        }
    }
    // progressBar.value = 0;
    // Function to update progress bar
    function updateProgressBar() {
        // progressBar.max = audio.duration;
        // progressBar.min = 0;
        progressBar.value = (audio.currentTime / audio.duration) * 100;
    }

    function seekTrack(event) {
        const progressBarRect = progressBar.getBoundingClientRect();
        const seekTime = ((event.clientX - progressBarRect.left) / progressBarRect.width) * audio.duration;
        audio.currentTime = seekTime;
    }


    if (trackItems.length > 0) {
        loadTrackDetails(currentTrackIndex);
    }

    // Check if the mathcing attribute is available in the DOM and Add event listeners
    initializeControl('[data-audioplayer-control="repeat-playlist"]', (control) => {
        control.addEventListener('click', toggleRepeatPlaylist);
    });
    initializeControl('[data-audioplayer-control="repeat-track"]', (control) => {
        control.addEventListener('click', toggleRepeatTrack);
    });
    initializeControl('[data-audioplayer-control="volume"]', (control) => {
        control.addEventListener('click', updateVolume);
    });
    initializeControl('[data-audioplayer-control="mute-unmute"]', (control) => {
        control.addEventListener('click', toggleMuteUnmute);
    });
    initializeControl('[data-audioplayer-control="progress-bar"]', (control) => {
        control.addEventListener('click', seekTrack);
    });
    initializeControl('[data-audioplayer-control="progress-bar"]', (control) => {
        control.addEventListener('timeupdate', updateProgressBar);
    });

    // Initialize the player with the first track
    loadAndPlayTrack(currentTrackIndex);
}


// Initialize all audio players on the page
const audioPlayers = document.querySelectorAll('[data-audioplayer]');
// console.log('Audio players found:', audioPlayers);

audioPlayers.forEach((player) => {
    // console.log('Initializing player:', player);
    initializeAudioPlayer(player);
});