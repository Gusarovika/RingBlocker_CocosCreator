import { GameObjectManager } from './GameObjectManager';
import { _decorator, Component, Node, JsonAsset, Enum, v2, resources, Asset, SpriteFrame, Prefab } from 'cc';
import GameObjectType from '../Enums/GameObjectType';
import { GameObject } from '../GameObjects/GameObject';
import { ObjectPool } from '../Utils/ObjectPool';
import ColorType from '../Enums/ColorType';
import { SoundManager } from './SoundManager';
import SoundType from '../Enums/SoundType';
import { UiManager } from './UiManager';
import { EventType, customEvent } from '../Enums/GameEvent';

const { ccclass, property } = _decorator;
Enum(GameObjectType);
Enum(ColorType);

@ccclass('LevelManager')
export class LevelManager extends Component {
	@property({ type: [JsonAsset], tooltip: 'Array of JsonAssets' })
	data: JsonAsset[] = [];

	@property({ type: ObjectPool, tooltip: 'Reference to the ObjectPool' })
	objectPool: ObjectPool = null;

	@property({ type: GameObjectManager, tooltip: 'Reference to the GameObjectManager' })
	gameObjectManager: GameObjectManager = null;

	@property({ type: Node, tooltip: 'Reference to the world Node' })
	public world: Node = null;

	@property({ type: SoundManager, tooltip: 'Reference to the SoundManager' })
	soundManager: SoundManager = null;

	@property({ type: UiManager, tooltip: 'Reference to the UiManager' })
	ui: UiManager = null;

	private _data: {} = {};
	private _objectArray: GameObject[] = [];
	private _countLevel: number = 0;

	protected onLoad(): void {}

	protected onEnable() {
		this._init();
		customEvent.on(EventType.LEVEL_RESTART, this.onLevelRestart, this);
		customEvent.on(EventType.LEVEL_NEXT, this.onLevelNext, this);
	}

	/*  init level*/
	private async _init() {
		if (this.ui.loader) this.ui.loader.node.active = true;
		this._setLevelData(this.data[this._countLevel]);

		await this._createPools();
		await this._createLevel();
		if (this.ui.loader) this.ui.loader.node.active = false;
		if (this.ui.tutor && this.ui.tutor) this.ui.tutor.activate();
		if (this.soundManager) this.soundManager.play(SoundType.Complete, 1, true);
	}

	/*  set the json file with data for level*/
	private _setLevelData(levelData: JsonAsset) {
		this._data = levelData.json;
	}

	/*  create GameObject from gameObjectManager and add it on scene*/
	private _createGameObject(type: string, position: { x: number; y: number }, angle: number, specify: {}): void {
		const info = { parent: this.node, x: position.x, y: position.y, angle, specify };

		this.gameObjectManager.createGameObject(type, info, (go: GameObject, gon: Node) => {
			this._objectArray.push(go);
			go.level = this;
			this.world.addChild(gon);
		});
	}

	/* creating pools for objects*/
	private async _createPools() {
		let loadedCount = 0;
		for (let objectIndex in this._data) {
			const gameObjectData = this._data[objectIndex];
			if (!gameObjectData) return;
			const path = gameObjectData.path;
			const prefab = await this._loadResourceAsync(path, Prefab);
			if (prefab) {
				const type = gameObjectData.type;
				this.objectPool.initPool(prefab, type);
				loadedCount += 1;
				let progress = loadedCount / Object.keys(this._data).length;
				if (this.ui.loader) this.ui.loader.progress = progress;
			} else {
				console.error(`Failed to load prefab at path: ${gameObjectData.path}`);
			}
		}
	}

	/* create level after loading all resources*/
	private async _createLevel() {
		for (let objectIndex in this._data) {
			const gameObjectData = this._data[objectIndex];
			const type = gameObjectData.type;
			const position = v2(gameObjectData.x, gameObjectData.y);
			const angle = gameObjectData.angle;
			const image = await this._loadResourceAsync(gameObjectData.imagePath, SpriteFrame);
			const color = ColorType[gameObjectData.color];
			const specify = { mainImage: image, color: color };

			if (gameObjectData.blockers) {
				const blockImage = await this._loadResourceAsync(gameObjectData.blockerPath, SpriteFrame);
				const blockPrefab = await this._loadResourceAsync(gameObjectData.blockerPrefabPath, Prefab);

				specify['blockers'] = gameObjectData.blockers;
				specify['blockImage'] = blockImage;
				specify['blockPrefab'] = blockPrefab;
			}

			this._createGameObject(type, position, angle, specify);
		}
	}

	/* load resource from bundle*/

	private async _loadResourceAsync(path: string, type: typeof Asset) {
		return new Promise<any>((resolve, reject) => {
			resources.load(path, type, (err, asset) => {
				if (err) {
					reject(err);
				} else {
					resolve(asset);
				}
			});
		});
	}

	/* restart level */
	private _restart() {
		this.objectPool.reset();
		this._init();
		this.ui.toggleResult(false);
	}

	/* remove object from object array and from nodepool */
	public deleteGameObject(go: GameObject) {
		const index = this._objectArray.indexOf(go);
		this.gameObjectManager.destroyGameObject(go);
		this._objectArray.splice(index, 1);
		if (this._objectArray.length === 0) {
			if (this.ui.tutor) this.ui.tutor.node.active = false;
			let hasNext = this._countLevel < this.data.length - 1;
			this.ui.toggleResult(true, hasNext);
			this.soundManager.stop();
		}
	}

	/* handle restart event */
	private onLevelRestart() {
		this._restart();
	}

	/* handle next level event */
	private onLevelNext() {
		this._countLevel = Math.min(this._countLevel + 1, this.data.length - 1);
		this._restart();
	}
}
