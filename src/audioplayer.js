/**
 * @name audioplayer.js
 * @version 1.0
 * @author luca mack
 * @description provides an API to insert an audioplayer element on a website by just adding HTML attributes to elements 
 * @link https://github.com/LucaIsMyName/audioplayer.js
*/
(function () {
    function initializeAudioPlayer(player) {
        // Container Elements for Controls and Playlist
        const controls = player.querySelector('[data-audioplayer-controls]');
        const playlist = player.querySelector('[data-audioplayer-playlist]');
        // Elements where the current Track Infos are renderd in
        const currentTrackImage = player.querySelector('[data-audioplayer-current="cover"]');
        const currentTrackTitle = player.querySelector('[data-audioplayer-current="title"]');
        const currentArtistTitle = player.querySelector('[data-audioplayer-current="artist"]');
        // Controls
        const playPauseButton = controls.querySelector('[data-audioplayer-control="play-pause"]');
        const prevButton = controls.querySelector('[data-audioplayer-control="prev"]');
        const nextButton = controls.querySelector('[data-audioplayer-control="next"]');
        const repeatPlaylistButton = controls.querySelector('[data-audioplayer-control="repeat-playlist"]');
        const repeatTrackButton = controls.querySelector('[data-audioplayer-control="repeat-track"]');
        const volumeInput = controls.querySelector('[data-audioplayer-control="volume"]');
        const muteUnmuteButton = controls.querySelector('[data-audioplayer-control="mute-unmute"]');
        const progressBar = controls.querySelector('[data-audioplayer-control="progress-bar"]');

        const trackItems = Array.from(playlist.querySelectorAll('[data-audioplayer-track][data-audioplayer-track-url]'));
        let currentTrackIndex = 0;
        let audio = new Audio();

        function initializeControl(selector, action) {
            const control = controls.querySelector(selector);
            if (control) {
                action(control);
            }
        }
        /**
         * @name loadTrackDetails
         * @param {number} index 
         */
        function loadTrackDetails(index) {
            const trackItem = trackItems[index];
            if (!trackItem) {
                console.error('Track item is undefined. Index:', index);
                return;
            }

            const trackURL = trackItem.getAttribute('data-audioplayer-track-url');
            if (!trackURL) {
                console.error('Track URL is missing for index:', index);
                return;
            }

            audio.src = trackURL;

            const trackImage = trackItem.querySelector('[data-audioplayer-track="cover"]');
            const trackTitle = trackItem.querySelector('[data-audioplayer-track="title"]');
            const artistTitle = trackItem.querySelector('[data-audioplayer-track="artist"]');

            if (currentTrackImage && trackImage) {
                currentTrackImage.src = trackImage.src;
            } else {
                console.log('Track image not found for index:', index);
            }

            if (trackTitle) {
                currentTrackTitle.textContent = trackTitle.textContent;
            } else {
                console.log('Track title not found for index:', index);
            }

            if (artistTitle) {
                currentArtistTitle.textContent = artistTitle.textContent;
            } else {
                console.log('Artist title not found for index:', index);
            }

            playPauseButton.setAttribute('data-audioplayer-current-state', 'pause');
        }

        trackItems.forEach((trackItem, index) => {
            trackItem.addEventListener('click', () => {
                currentTrackIndex = index;
                loadTrackDetails(index);
                playPauseButton.setAttribute('data-audioplayer-current-state', 'play');
                audio.play();
            });
        });

        function loadAndPlayTrack(index) {

            currentTrackIndex = index;
            loadTrackDetails(index);

            audio.play().then(() => {
                playPauseButton.setAttribute('data-audioplayer-current-state', 'play');
            }).catch(error => {
            });
        }


        initializeControl('[data-audioplayer-control="play-pause"]', (control) => {
            control.addEventListener('click', () => {
                if (audio.paused) {
                    audio.play();
                    control.setAttribute('data-audioplayer-current-state', 'play');
                } else {
                    audio.pause();
                    control.setAttribute('data-audioplayer-current-state', 'pause');
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

        progressBar.value = 0;

        function updateProgressBar() {
            const duration = audio.duration;
            if (duration > 0) {
                progressBar.value = (audio.currentTime / duration) * 100;
            }
        }

        // Attach timeupdate event listener to audio element
        audio.addEventListener('timeupdate', updateProgressBar);

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
            control.addEventListener('input', (event) => {
                const duration = audio.duration;
                if (duration > 0) {
                    const value = event.target.value;
                    audio.currentTime = (value / 100) * duration;
                }
            });
        });
        initializeControl('[data-audioplayer-control="prev"]', (control) => {
            control.addEventListener('click', () => {
                currentTrackIndex = (currentTrackIndex + trackItems.length) % trackItems.length;
                loadAndPlayTrack(currentTrackIndex);

            });
        });
        initializeControl('[data-audioplayer-control="next"]', (control) => {
            control.addEventListener('click', () => {
                currentTrackIndex = (currentTrackIndex) % trackItems.length;
                loadAndPlayTrack(currentTrackIndex);
            });
        });


        // Initialize the player with the first track
        loadAndPlayTrack(currentTrackIndex);
    }


    // Initialize all audio players on the page
    const audioPlayers = document.querySelectorAll('[data-audioplayer]');

    audioPlayers.forEach((player) => {
        initializeAudioPlayer(player);
    });
})();
