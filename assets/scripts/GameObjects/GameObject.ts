import { _decorator, Component, Enum, Node, Vec3, tween, easing, CCInteger, find } from 'cc';
import { SoundManager } from './../Managers/SoundManager';
import { LevelManager } from '../Managers/LevelManager';
import GameObjectType from '../Enums/GameObjectType';
import ColorType from '../Enums/ColorType';
import SoundType from '../Enums/SoundType';

const { ccclass, property } = _decorator;

Enum(GameObjectType);
Enum(ColorType);
Enum(SoundType);

@ccclass('GameObject')
export class GameObject extends Component {
	@property({
		type: GameObjectType,
		tooltip: 'The type of object for prefab binding',
	})
	public type: GameObjectType = GameObjectType.None;

	@property({
		type: ColorType,
		tooltip: 'The color of the object',
	})
	public color: ColorType = ColorType.None;

	@property({
		type: Node,
		visible: function () {
			return this.isRing;
		},
	})
	public blockers: Node = null; /* Node property for blockers, visible based on 'isRing'*/

	@property({ type: Node })
	public render: Node = null; /* Node property for rendering*/

	@property({ type: CCInteger })
	private _moveY: number = -1900; /* Private property for Y-axis movement*/

	public isFalling: boolean = false; /* Flag indicating if the object is falling*/
	public hasBlockers: boolean = false; /* Flag indicating if the object has blockers*/
	public level: LevelManager = null; /* Reference to LevelManager*/

	/* initiate falling animation*/
	public fall() {
		if (this.isFalling) return;
		this.isFalling = true;
		this.playSound(SoundType.Unlock);

		tween()
			.target(this.node)
			.delay(Math.random() * 0.1 + 0.4)
			.by(1.0, { position: new Vec3(0, this._moveY, 0) }, { easing: easing.circIn })
			.call(() => {
				this.level.deleteGameObject(this);
			})
			.start();
	}

	/*  play a sound based on SoundType*/
	public playSound(type: SoundType) {
		const soundManager = find('SoundManager').getComponent(SoundManager);
		if (soundManager) soundManager.play(type);
	}
}
