import { _decorator, Component, Prefab, SpriteFrame, instantiate, Node, Vec3, Sprite, Enum } from 'cc';
import { GameObject } from '../GameObjects/GameObject';
import { ObjectPool } from '../Utils/ObjectPool';
import GameObjectType from '../Enums/GameObjectType';
import ColorType from '../Enums/ColorType';

const { ccclass, property } = _decorator;

interface GameObjectInfo {
	x: number;
	y: number;
	parent: Node;
	angle: number;
	specify: {
		color?: ColorType;
		mainImage?: SpriteFrame;
		blockers?: [];
		blockImage?: SpriteFrame;
		blockPrefab?: Prefab;
	};
}

Enum(GameObjectType);

@ccclass('GameObjectManager')
export class GameObjectManager extends Component {
	@property({ type: ObjectPool }) objectPool: ObjectPool = null;

	/*  createGameObject according to params*/
	public createGameObject(type: string, info: GameObjectInfo, callback?: Function) {
		const createObj = this.objectPool.getPrefabPool(type);
		createObj.angle = info.angle;
		createObj.setPosition(new Vec3(info.x, info.y, 0));
		const go = createObj.getComponent(GameObject);
		go.color = info.specify.color;
		if (!go.render) {
			go.render = go.node.getChildByName('Render') || new Node();
		}
		let sprite = go.render.getComponent(Sprite) || go.render.addComponent(Sprite);
		sprite.spriteFrame = info.specify.mainImage;

		if (info.specify.blockers) {
			info.specify.blockers.forEach((blockerAngle) => {
				let block = instantiate(info.specify.blockPrefab);
				block.layer = go.blockers.layer;
				block.angle = blockerAngle;
				block.getComponent(Sprite).spriteFrame = info.specify.blockImage;
				go.blockers.addChild(block);
			});
			go.hasBlockers = true;
		}
		callback instanceof Function && callback(go, createObj);
	}

	/*  remove game object from scene and put it pack to pool*/
	public destroyGameObject(go: GameObject) {
		let poolType = GameObjectType[go.type];
		this.objectPool.putBackToPool(poolType, go.node);
	}
}
