// export const customControls = (player: any) => {

  //   const setupCustomControls = (player: any) => {
  //     // Add skip forward button (5 seconds)
  //     player.controlBar.addChild(
  //       "button",
  //       {
  //         text: "⏩",
  //         className: "vjs-skip-forward-button",
  //         handler: function (this: any) {
  //           const skipAmount = 5;
  //           player.currentTime(
  //             Math.min(player.currentTime() + skipAmount, player.duration())
  //           );
  //         },
  //       },
  //       player.controlBar.children_.length - 1
  //     ); // Insert before fullscreen button
    
  //     // Add skip backward button (5 seconds)
  //     player.controlBar.addChild(
  //       "button",
  //       {
  //         text: "⏪",
  //         className: "vjs-skip-backward-button",
  //         handler: function (this: any) {
  //           const skipAmount = 5;
  //           player.currentTime(Math.max(player.currentTime() - skipAmount, 0));
  //         },
  //       },
  //       player.controlBar.children_.length - 2
  //     ); // Insert before forward button
    
  //     // Add playback speed button if not already present
  //     if (!player.controlBar.getChild("playbackRateMenuButton")) {
  //       player.controlBar.addChild(
  //         "playbackRateMenuButton",
  //         {
  //           playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
  //         },
  //         player.controlBar.children_.length - 3
  //       );
  //     }
    
  //     // Enable keyboard seeking
  //     player.on("keydown", function (event: KeyboardEvent) {
  //       // Left arrow key - seek back 5 seconds
  //       if (event.key === "ArrowLeft") {
  //         event.preventDefault();
  //         player.currentTime(Math.max(player.currentTime() - 5, 0));
  //       }
    
  //       // Right arrow key - seek forward 5 seconds
  //       else if (event.key === "ArrowRight") {
  //         event.preventDefault();
  //         player.currentTime(Math.min(player.currentTime() + 5, player.duration()));
  //       }
    
  //       // Up arrow key - increase volume
  //       else if (event.key === "ArrowUp") {
  //         event.preventDefault();
  //         player.volume(Math.min(player.volume() + 0.1, 1));
  //       }
    
  //       // Down arrow key - decrease volume
  //       else if (event.key === "ArrowDown") {
  //         event.preventDefault();
  //         player.volume(Math.max(player.volume() - 0.1, 0));
  //       }
    
  //       // Spacebar - toggle play/pause
  //       else if (event.key === " " || event.key === "Spacebar") {
  //         event.preventDefault();
  //         if (player.paused()) {
  //           player.play();
  //         } else {
  //           player.pause();
  //         }
  //       }
    
  //       // 'M' key - toggle mute
  //       else if (event.key === "m" || event.key === "M") {
  //         event.preventDefault();
  //         player.muted(!player.muted());
  //       }
    
  //       // Numbers 0-9 - seek to percentage of video
  //       else if (/^[0-9]$/.test(event.key)) {
  //         event.preventDefault();
  //         const percent = parseInt(event.key) * 10;
  //         player.currentTime((player.duration() * percent) / 100);
  //       }
  //     });
    
  //     // Style the custom buttons
  //     const style = document.createElement("style");
  //     style.textContent = `
  //       .vjs-skip-forward-button,
  //       .vjs-skip-backward-button {
  //         font-size: 0.8em;
  //         cursor: pointer;
  //       }
  //       .video-js .vjs-time-control {
  //         display: block;
  //       }
  //       .video-js .vjs-remaining-time {
  //         display: none;
  //       }
  //       .video-js:focus {
  //         outline: none;
  //       }
  //     `;
  //     document.head.appendChild(style);
  //   };

  //   setupCustomControls(player);
  // };