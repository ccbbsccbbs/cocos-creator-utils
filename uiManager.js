/**
 * @author ccbbsccbbs
 * @file to manager the projet ui
 * @example
 * ```js
 * const _uiMgr=require('uiManager');
 * ```
 * > before use you should meet these conditions
 * - put the ui prefab in the "resources/prefab" folder
 * - set the _prefabName to the ui script file like:
 * ```js
 * const ui=cc.Class({});
 * ui._prefabName=`${prefabNameOfThisUI}`;
 * ```
 */

module.exports = {
    _uiCache: {},
    _uiHistory: {},
    /**
     * !#en show ui
     * @param {string} name -the ui name,it is the script file name
     * @param {cc.Node} parentNode -the node that the ui node will add to
     * @returns {Promise<cc.Node>} -cc.Node of the ui will be return
     * 
     * @example
     * ```js
     * _uiMgr.showUI('lobby').then(lobbyNode => lobbyNode.x = 0);
     * ```
     */
    showUI(name, parentNode = cc.find('Canvas')) {
        const {
            _class,
            _prefab
        } = this._uiCache[name] || {};

        if (_prefab) return Promise.resolve(this._showNode(_prefab, _class, parentNode));

        const _cache = this._initCache(name);
        this._loadUIPrefab('prefab/' + _cache._class._prefabName)
            .then(
                prefab => {
                    _cache._prefab = prefab;
                    const _node = this._showNode(prefab, _cache._class, parentNode);
                    return Promise.resolve(_node);
                },
                err => console.error(err)
            )
    },

    /**
     * !#en hide the given ui
     * @param {string} name -the ui name,it is the script file name
     */
    hideUI(name) {
        const _uiNode = this._uiHistory[name];
        _uiNode && _uiNode.destroy();
    },
    /**
     * !#en pre instantiate the ui prefab
     * @param {string} name -the ui name,it is the script file name
     * @returns {Promise<cc.Prefab>} 
     * @example
     * ```js
     * uiMgr.preInstantiatePrefab('Comp1').then(() => uiMgr.showUI('Comp1'));
     * ```
     */
    preInstantiatePrefab(name) {
        const {
            _prefab
        } = this._uiCache[name] || {};
        if (_prefab) return Promise.resolve(_prefab);
        const _cache = this._initCache(name);
        return this._loadUIPrefab('prefab/' + _cache._class._prefabName)
            .then(
                prefab => Promise.resolve(_cache._prefab = prefab),
                err => console.error(err)
            )
    },
    _initCache(name) {
        return this._uiCache[name] = {
            _class: require(name),
            _prefab: null
        }
    },
    _loadUIPrefab(path) {
        return new Promise((resolve, reject) => cc.resources.load(
            path,
            cc.Prefab,
            (err, asset) => {
                err ? reject(err) : resolve(asset);
            }
        ))
    },
    _showNode(prefab_, class_, parentNode_) {
        const _node = cc.instantiate(prefab_);
        _node.addComponent(class_);
        _node.parent = parentNode_;
        this._uiHistory[cc.js.getClassName(class_)] = _node;
        return _node;
    }
}
