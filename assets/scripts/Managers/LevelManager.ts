import { GameObjectManager } from './GameObjectManager';
import {
	_decorator,
	Component,
	Node,
	JsonAsset,
	Enum,
	v2,
	resources,
	Asset,
	SpriteFrame,
	Prefab,
	ProgressBar,
} from 'cc';
import GameObjectType from '../Enums/GameObjectType';
import { GameObject } from '../GameObjects/GameObject';
import { ObjectPool } from '../Utils/ObjectPool';
import { Tutorial } from '../Ui/Tutorial';
import ColorType from '../Enums/ColorType';
import { SoundManager } from './SoundManager';
import SoundType from '../Enums/SoundType';

const { ccclass, property } = _decorator;
Enum(GameObjectType);
Enum(ColorType);

@ccclass('LevelManager')
export class LevelManager extends Component {
	@property({ type: JsonAsset }) data: JsonAsset = null;
	@property({ type: ObjectPool }) objectPool: ObjectPool = null;
	@property({ type: GameObjectManager }) gameObjectManager: GameObjectManager = null;
	@property({ type: Node }) public world: Node = null;
	@property({ type: ProgressBar }) public loader: ProgressBar = null;
	@property({ type: Tutorial }) tutor: Tutorial = null;
	@property({ type: SoundManager }) soundManager: SoundManager = null;

	_level: {} = {};
	_data: {} = {};
	_objectArray: GameObject[] = [];

	protected onLoad(): void {
		this._setLevelData(this.data);
	}

	protected async onEnable() {
		this.loader.node.active = true;
		await this._createPools();
		await this._createLevel();
		this.loader.node.active = false;
		if (this.tutor) this.tutor.activate();
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
				this.loader.progress = progress;
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

	/* remove object from object array and from nodepool */

	public deleteGameObject(go: GameObject) {
		const index = this._objectArray.indexOf(go);
		this.gameObjectManager.destroyGameObject(go);
		this._objectArray.splice(index, 1);
		if (this._objectArray.length === 0) {
			if (this.tutor) this.tutor.node.active = false;
		}
	}
}
