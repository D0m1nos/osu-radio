export const PlaylistAnimations = {
    keyframes: {
        "playlist-item-appear": {
            from: {transform: "scale(0,0)"},
            to: {transform: "scale(1,1)"}
        },
        "playlist-enter-playlist": {
            from: {transform: "translateX(100%)"},
            to: {transform: "translateX(0%)"}
        },
        "playlist-exit-playlist": {
            from: {transform: "translateX(-100%)"},
            to: {transform: "translateX(0%)"}
        },
        "playlist-show-createBox": {
            from: {transform: "scale(0,0)"},
            to: {transform: "scale(1,1)"}
        }
    },
    animation: {
        "playlist-item-appear": "playlist-item-appear 130ms ease-out forwards",
        "playlist-enter-playlist": "playlist-enter-playlist 150ms ease-in-out forwards",
        "playlist-exit-playlist": "playlist-exit-playlist 150ms ease-in-out forwards",
        "playlist-show-createBox": "playlist-show-createBox 150ms ease-in-out forwards",
    }
}