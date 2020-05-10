var SoundService = {
    _sndItem: null,

    init: function() {
        SoundService._sndItem = new Howl({
            src: ['./sound/item.wav'],
            preload: true
        });
    },

    playItemDrop: function() {
        if (!appState.options.soundEnabled) {
            return;
        }
        
    	SoundService._sndItem.play();
    },
}