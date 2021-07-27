/**
 * @author ccbbsccbbs
 * @file to manager the sound
 * @example
 * ```js
 * const _soundMgr=require('audioManager');
 * ```
 * > before use you should meet this condition
 * - put the mp3 in the "resources/sound" folder
 */
module.exports = {
    _audioCache: {},
    _playHistory: {},
    /**
     * !#en preload sound
     * @param {string?} name 
     * - if para is undefined . mgr will load the sound dir
     * - if para is string . mgr will load the sound that given name
     * - if para is array<string> . mgr will load all the sound that given name
     * @returns {string|string[]} loaded sound name or name's array
     */
    preloadSound(name) {
        if (this._audioCache[name]) return Promise.resolve(this._audioCache);
        switch (typeof name) {
            case 'undefined': return this._loadSoundDir();
            case 'string': return this._loadSound(name);
            case 'object': return Promise.all(name.map(v => this._loadSound(v)));
        }
    },
    /**
     * 
     * @param {string} name the sound name
     * @param {boolean?} loop 
     * @param {number?} volume 
     * @returns 
     */
    playEffect(name, loop, volume) {
        return this._playSound(name, volume, loop,
            'setEffectsVolume',
            'playEffect'
        );
    },
    /**
     * !#en you can stop the sound by sound name or id
     * @param {string|number} nameOrId 
     */
    stopEffect(nameOrId) {
        switch (typeof nameOrId) {
            case 'undefined': cc.audioEngine.stopAllEffects(); break;
            case 'string': cc.audioEngine.stopEffect(this._playHistory[nameOrId]); break;
            case 'number': cc.audioEngine.stopEffect(nameOrId); break;
        }
    },
    /**
     * 
     * @param {string} name 
     * @param {boolean?} loop 
     * @param {number?} volume 
     * @returns 
     */
    playMusic(name, loop, volume) {
        return this._playSound(name, volume, loop,
            'setMusicVolume',
            'playMusic'
        );
    },
    stopMusic() {
        cc.audioEngine.stopMusic();
    },
    _playSound(name, volume, loop, volumeFunc, playFunc) {
        if (volume) cc.audioEngine[volumeFunc](volume);
        const _id = cc.audioEngine[playFunc](this._audioCache[name], !!loop);
        this._playHistory[name] = _id;
        cc.audioEngine.setFinishCallback(_id, () => this._playHistory[_id] = null);
        return _id;
    },
    _loadSound(name, path = 'sound/' + name) {
        return this._audioCache[name] || new Promise((resolve, reject) => {
            cc.resources.load(path, cc.AudioClip, (err, asset) => {
                if (err) return reject(err);
                this._audioCache[name] = asset;
                resolve(name);
            })
        })
    },
    _loadSoundDir() {
        return new Promise((resolve, reject) => {
            cc.resources.loadDir('sound', cc.AudioClip, (err, assets) => {
                if (err) return reject(err);
                assets.forEach(v => this._audioCache[v.name] = v);
                resolve(assets.map(v=>v.name));
            })
        })
    }
}
