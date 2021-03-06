"use strict";

/**
* Export a level.
*
* @namespace LR
* @class LevelExporter
* @constructor
*/
LR.LevelExporter = function() {

};

/**
* Export all the level.
*
* @method export
* @param {Phaser.Game} game The game of the level
* @return {Object} exported level
*/
LR.LevelExporter.prototype.export = function(_game, _project,_cutscenes) {
	var level = new Object();

	level.assets = this.exportAssets(_game, _project);
	level.objects = this.exportEntities(_game.world);
	level.settings = _project.settings;
	level.cutscenes = _cutscenes;

	return level;
};

/***********
** ASSETS **
***********/

/**
* Export all the level's assets.
*
* @method exportAssets
* @param {Phaser.Cache} cache The game's cache of the level
* @return {Object} exportable level's assets
*/
LR.LevelExporter.prototype.exportAssets = function(_game, _project) {
	var assets = new Object();

	assets.images = this.exportImages(_game, _project);
	assets.atlases = this.exportAtlases(_game,_project);
	assets.sounds = this.exportSounds(_game,_project);
	assets.behaviours = this.exportBehaviours(_game, _project);
	assets.bitmapFonts = _project.assets.bitmapFonts;

	return assets;
};

/***********
** IMAGES **
***********/

/**
* Export all the level's images.
*
* @method exportImages
* @param {Phaser.World} level's world
* @return {Array} level's images
*/
LR.LevelExporter.prototype.exportImages = function(_game, _project) {
	var keys = new Array();

	keys = this.getImageKeys(_game.world, keys);

	//var images = this.getExportableImages(_game.cache, keys);
	var images = this.getExportableImages(keys, _project.assets.images);

	return images;
};

/**
* Return the image keys of the entities and its children.
*
* @method getImages
* @param {LR.Entity} entity
* @param {Array} keys array stored
* @return {Array} image keys
*/
LR.LevelExporter.prototype.getImageKeys = function(_entity, _keys) {
	if( _keys == null)
		_keys = new Array();

	if (_entity.key) {
		if (_keys.indexOf(_entity.key) < 0) {
			_keys.push(_entity.key);
		}
	}
	
	if (_entity.children != null) {
		for (var i = 0; i < _entity.children.length; i++) {
			var child = _entity.children[i];
			_keys = this.getImageKeys(child, _keys);
		};
	}

	return _keys;
};

/**
* Export all the level's images.
*
* @method exportImages
* @param {Phaser.Cache} cache The game's cache of the level
* @return {Array} level's image keys
* @return {Array} exportable level's images
*/
/*LR.LevelExporter.prototype.getExportableImages = function(_cache, _keys) {
	var images = new Array();

	for (var i = 0; i < _keys.length; i++) {
		var key = _keys[i];
		var cachedImage = _cache.getImage(key);
		var frame = _cache.getFrameByIndex(key, 0);
		var image = this.exportImage(cachedImage, frame);
		if (LR.LevelUtilities.IsEditorImage(image) == false) {
			images.push(image);
		}
	};

	return images;
};*/
LR.LevelExporter.prototype.getExportableImages = function(_keys, _imagesData) {
	var images = new Array();

	for (var i = 0; i < _keys.length; i++) {
		var key = _keys[i];

		var j = 0;
		var found = false;
		while (j<_imagesData.length && found == false) {
			var imageData = _imagesData[j];
			if (imageData.name == key) {
				if (LR.LevelUtilities.IsEditorImage(imageData) == false) {
					images.push(imageData);
				}

				found = true;
			}

			j++;
		}
	};

	return images;
};

/**
* Export a cached image into an exportable image.
*
* @method exportImage
* @param {Image} cachedImage The cached image
* @param {Phaser.Frame} frame The default frame of the image
* @return {Object} exportable level's images
*/
LR.LevelExporter.prototype.exportImage = function(_cachedImage, _frame) {
	var image = new Object();

	image.name = _cachedImage.name;
	image.src = _cachedImage.getAttribute("src");
	image.width = _cachedImage.width;
	image.height = _cachedImage.height;
	if (_frame) {
		image.frameWidth = _frame.width;
		image.frameHeight = _frame.height;
	}

	return image;
};

/************
** ATLASES **
*************/

LR.LevelExporter.prototype.exportAtlases = function(_game, _project) {
	var atlases = new Array();
	atlases = this.getAtlases(_game.world, atlases);

	//search path Data for each atlas to export
	var objectsAtlases = new Array();
	for(var i=0; i < atlases.length; i++){
		var obj = { name : atlases[i]};
		for(var j = 0; j < _project.assets.atlases.length; j++){
			if( _project.assets.atlases[j].name == obj.name ){
				obj.path = _project.assets.atlases[j].path;
				break;
			}
		}
		objectsAtlases.push(obj);
	}

	return objectsAtlases;
};

LR.LevelExporter.prototype.getAtlases = function(_entity, _atlases) {
	if( _atlases == null)
		_atlases = new Array();

	if (_entity.key && _entity.isAtlas && _entity.frameName) {
		if (_atlases.indexOf(_entity.key) < 0) {
			_atlases.push(_entity.key);
		}
	}
	
	if (_entity.children != null) {
		for (var i = 0; i < _entity.children.length; i++) {
			var child = _entity.children[i];
			_atlases = this.getAtlases(child, _atlases);
		};
	}

	return _atlases;
};

/***********
** SOUNDS **
***********/

LR.LevelExporter.prototype.exportSounds = function(_game, _project) {
	var sounds = new Array();

	var entitiesToCheck = [_game.world];
	var entity = null;
	//check every entity in the world to add the used audios
	while(entitiesToCheck.length > 0){
		entity = entitiesToCheck[0];
		//Add every child to the list
		if( entity.children != null ){
			for(var c=0; c < entity.children.length; c++)
				entitiesToCheck.push(entity.children[c]);
		}
		//add audio
		if(entity.ed_sounds != null){
			var sound = null;
			for(var s=0; s < entity.ed_sounds.length; s ++){
				sound = entity.ed_sounds[s];
				var soundData = this.getExportableSoundData(sound.key,_project,sounds);
				if( soundData )
					sounds.push(soundData);
			}
		}
		//remove first
		entitiesToCheck.splice(0,1);
	}
	return sounds;
}

// Search for the data of the sound defined by _soundKey
// returns null if the data is already added to _selectedSounds or not found
LR.LevelExporter.prototype.getExportableSoundData = function(_soundKey,_project,_selectedSounds){
	var index = 0;
	var soundData = null;
	while( index < _project.assets.audios.length && soundData == null){
		if( _project.assets.audios[index].name == _soundKey)
			soundData = _project.assets.audios[index];
		else
			index++;
	}
	if( soundData == null ) return null;

	index = 0;
	while(index < _selectedSounds.length){
		if( _selectedSounds[index] == soundData)
			return null;
		index ++;
	}
	return soundData;
}

/***************
** BEHAVIOURS **
***************/

/**
* Export all the level's behaviours.
*
* @method exportBehaviours
* @param {Phaser.Game} game
* @param {Object} project data
* @return {Array} level's behaviours
*/
LR.LevelExporter.prototype.exportBehaviours = function(_game, _project) {
	var behaviours = new Array();

	behaviours = this.getBehaviours(_game.world, behaviours);

	behaviours = this.addPathToExportedBehaviours(behaviours, _project.assets.behaviours);

	return behaviours;
};

/**
* Return the behaviours of the entities and its children.
*
* @method getBehaviours
* @param {LR.Entity} entity
* @return {Array} behaviours
*/
LR.LevelExporter.prototype.getBehaviours = function(_entity, _behaviours) {
	if (_entity.behaviours) {
		_behaviours = this.mergeBehaviours(_entity.behaviours, _behaviours);
	}

	if (_entity.children != null) {
		for (var i = 0; i < _entity.children.length; i++) {
			var child = _entity.children[i];
			_behaviours = this.getBehaviours(child, _behaviours);
		};
	}

	return _behaviours;
};

/**
* Return a merge array of behaviours (no doublons).
*
* @method mergeBehaviours
* @param {LR.Entity} first group of behaviours
* @param {LR.Entity} second group of behaviours
* @return {Array} behaviours
*/
LR.LevelExporter.prototype.mergeBehaviours = function(_behaviours1, _behaviours2) {
	var behaviours = new Array();
	behaviours = behaviours.concat(_behaviours2);

	for (var i = 0; i < _behaviours1.length; i++) {
		var behaviour = _behaviours1[i];

		var j = 0;
		var found = false;
		while (j < _behaviours2.length && found == false) {
			if (behaviour.name == _behaviours2[j]) {
				found = true;
			}

			j++;
		}

		if (found == false) {
			behaviours.push(behaviour);
		}
	};

	return behaviours;
};

/**
* Add project path to exported behaviours.
*
* @method addPathToExportedBehaviours
* @param {Array} exported behaviours
* @return {Array} All behaviours with full data
*/
LR.LevelExporter.prototype.addPathToExportedBehaviours = function(_exportedBehaviours, _behavioursData) {
	for (var i = 0; i < _exportedBehaviours.length; i++) {
		var behaviour = _exportedBehaviours[i];

		var j = 0;
		var found = false;
		while (j < _behavioursData.length && found == false) {
			var data = _behavioursData[j];
			if (data.name == behaviour.name) {
				behaviour.path = data.path;

				found = true;
			}

			j++;
		}
	};

	return _exportedBehaviours;
};

/************
** OBJECTS **
************/

/**
* Export all the level's entities.
*
* @method exportEntities
* @param {Phaser.Group | GameObject} entity The entity object
* @return {Phaser.Group | GameObject} the exported entity and its descendants
*/
LR.LevelExporter.prototype.exportEntities = function(_entity) {
	var eObjects = null;

	//don't export editor's entities
	if (_entity.name) {
		if (_entity.name === "__world"
			|| (_entity.name[0] == "_" && _entity.name[1] == "_") == false) {
			// export parent
			eObjects = this.exportEntity(_entity);

			// if parent has children
			if (_entity.children.length > 0) {
				eObjects.children = new Array();
				for (var i=0; i<_entity.children.length; i++) {
					var child = _entity.children[i];
					// export child
					var obj = this.exportEntities(child);
					// add exported child
					if (obj != null) {
						eObjects.children.push(obj);
					}
				}
			}
		}
	}
	
	return eObjects;
};

/**
* Export all the level's entities.
*
* @method exportEntity
* @param {LR.Entity} entity The object to export
* @return {LR.Entity} the exported object
*/
LR.LevelExporter.prototype.exportEntity = function(_entity) {
	var eObj = new Object();

	eObj = this.setGeneral(_entity, eObj);

	eObj = this.setDisplay(_entity, eObj);
	
	//body
	if (_entity.body) {
		eObj = this.setPhysics(_entity, eObj);
	}

	eObj = this.setBehaviours(_entity, eObj);

	eObj = this.setTweens(_entity, eObj);

	eObj = this.setSounds(_entity, eObj);

	return eObj;
};

LR.LevelExporter.prototype.setGeneral = function(_entity, _object) {
	_object.type = LR.LevelUtilities.GetType(_entity);

	_object.name = _entity.name;
	if( _entity.go )
		_object.id = _entity.go.id;
	_object.x = _entity.x;
	_object.y = _entity.y;
	_object.scaleX = _entity.scale.x;
	_object.scaleY = _entity.scale.y;
	_object.angle = _entity.angle;
	
	if(_entity.anchor) 
		_object.anchor = { "x" : _entity.anchor.x, "y" : _entity.anchor.y };

	if(_entity.ed_locked == true) {
		_object.locked = true;
	}	

	if (_object.type !== LR.LevelUtilities.TYPE_TEXT && _object.type !== LR.LevelUtilities.TYPE_BITMAPTEXT) {
		_object.width = _entity.width;
		_object.height = _entity.height;
	} else {
		//TEXT
		if(_object.type == LR.LevelUtilities.TYPE_TEXT){
			_object.textData = {
				text : _entity.text,
				style : {
					font : _entity.style.font,
					fill : _entity.style.fill
				}
			};
		//BITMAP TEXT
		}else{
			_object.textData = {text : _entity.text,
								fontSize:_entity.fontSize,
								font : _entity.font};
			if(_entity.maxCharPerLine > 0)
				_object.textData.maxChar = _entity.maxCharPerLine;
		}

		//stroke thickness
		if(_entity.strokeThickness > 0){
			_object.textData.style.strokeThickness = _entity.strokeThickness;
			_object.textData.style.stroke = _entity.stroke;
		}
		//wrap
		if( _entity.wordWrap ){
			_object.textData.style.wordWrap = true;
			_object.textData.style.wordWrapWidth = _entity.wordWrapWidth;
		}
	}

	if( _entity.prefab ){
		_object.prefab = _entity.prefab;
	}

	return _object
};

LR.LevelExporter.prototype.setDisplay = function(_entity, _object) {
	_object.visible = _entity.visible;
	_object.alpha = _entity.alpha;

	if( _entity.ed_outOfViewHide == true )
		_object.outOfViewHide = true;

	//set key to null if none
	if (_entity.key && _entity.key != "none") {
		_object.key = _entity.key;
		_object.frame = _entity.frame;
	}

	if( _entity.isAtlas ){
		_object.frameName = _entity.frameName;
	}

	//fixedToCamera
	if (_entity.ed_fixedToCamera == true) {
		_object.fixedToCamera = true;
		_object.x = _entity.cameraOffset.x;
		_object.y = _entity.cameraOffset.y;
	}

	// TileSprite specifics
	if( _object.type == "LR.Entity.TileSprite") {
		// autoscroll
		if( _entity.scrollX != null ){
			_object.scrollX = _entity.scrollX;
			_object.scrollY = _entity.scrollY;
		}
	}

	// Button specifics
	if (_object.type == "LR.Entity.Button") {
		// frames
		_object.onOverFrameID = _entity.onOverFrameID | 0;
		_object.onOutFrameID = _entity.onOutFrameID | 0;
		_object.onDownFrameID = _entity.onDownFrameID | 0;
		_object.onUpFrameID = _entity.onUpFrameID | 0;
	}

	// Tint Color
	if( _object.type == "LR.Entity.TileSprite" || _object.type == "LR.Entity.Sprite"
		|| _object.type == "LR.Entity.Button" || _object.type == "LR.Entity.BitmapText"
	 ) {
		_object.tint = _entity.tint;
	}

	// Animations
	if( _entity.animations && _entity.animations._anims != {}){
		var entityAnims = _entity.animations._anims;
		_object.anims = {};
		for( var key in entityAnims){
			_object.anims[key] = {};
			_object.anims[key].frames = entityAnims[key]._frames;
			_object.anims[key].loop = entityAnims[key].loop;
			_object.anims[key].speed = entityAnims[key].speed;
			if(entityAnims[key].timer){
				_object.anims[key].timer = entityAnims[key].timer;
			}
		}
		if( _entity.autoPlayActive == true )
			_object.autoPlayAnim = _entity.autoPlayAnim;
	}

	return _object;
};

LR.LevelExporter.prototype.setPhysics = function(_entity, _object) {
	_object.layer = _entity.go.layer;

	_object.body = new Object();
	_object.body.motion = _entity.body.ed_motion;
	_object.body.enabled = _entity.body.ed_enabled;
	_object.body.fixedRotation = _entity.body.ed_fixedRotation;
	_object.body.angle = _entity.body.angle;
	_object.body.gravity = _entity.body.data.gravityScale;
	_object.body.mass = _entity.body.data.mass;
	_object.body.bindRotation = _entity.body.bindRotation;
	if( _entity.body.bindRotation )
		_object.body.offsetRotation = _entity.body._offsetRotation;
	_object.body.debug = _entity.body.ed_debugEditor;

	//export shapes
	_object.body.shapes = new Array();
	for(var i=0; i < _entity.go.getShapesCount(); i++){
		var data = _entity.go.getShapeData(i);
		var shape = _entity.go.getShape(i);
		data.sensor = shape.ed_sensor;
		_object.body.shapes.push( data );
	}

	return _object;
};

LR.LevelExporter.prototype.setBehaviours = function(_entity, _object) {
	_object.behaviours = [];
	if( _entity.behaviours){
		_object.behaviours = JSON.parse( JSON.stringify(_entity.behaviours) );
	}

	return _object;
};

LR.LevelExporter.prototype.setTweens = function(_entity, _object) {
	
	if(_entity.go != null && _entity.go.tweensData != null 
		&& Object.keys(_entity.go.tweensData).length > 0){
		_object.tweens = new Object();
		for(var key in _entity.go.tweensData){
			_object.tweens[key] = JSON.parse( 
										JSON.stringify(
											_entity.go.tweensData[key].data
										)
									);

		}
	}
	return _object;
};

LR.LevelExporter.prototype.setSounds = function(_entity, _object) {
	if( _entity.ed_sounds != null && _entity.ed_sounds.length > 0 ){
		_object.sounds = _entity.ed_sounds;
	}
	return _object;
};