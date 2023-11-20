import { _decorator, EventTouch, Vec2, UITransform, Vec3, tween, Input, Enum } from 'cc';
import { GameObject } from './GameObject';
import { ColliderComponent } from '../Collision/ColliderComponent';
import { EventType, customEvent } from '../Enums/GameEvent';
import SoundType from '../Enums/SoundType';

Enum(SoundType);

const { ccclass } = _decorator;

@ccclass('Ring')
export class Ring extends GameObject {
	/* private variables*/
	private _colliderComponent = null;
	private _startTouchPos: Vec2 = Vec2.ZERO;
	private _startTouchAngle: number = 0;
	private _currentPos: Vec2 = Vec2.ZERO;
	private _startMoveAngle: number = 0;
	private _centerPos: Vec3 = Vec3.ZERO;
	private _canMove: boolean = true;

	/* public properties*/
	public isRing: boolean = true;
	public hasBlockers: boolean = false;

	/* set up event handlers*/
	protected onLoad(): void {
		this._toggleEventHandlers(true);
		this._startTouchAngle = this.node.angle;
	}

	/* setting up collider component*/
	protected onEnable(): void {
		this._colliderComponent = this.getComponent(ColliderComponent) || this.addComponent(ColliderComponent);
	}

	/* initialize properties*/
	protected start(): void {
		this._centerPos = this.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
	}

	/* toggle event handlers on or off*/
	private _toggleEventHandlers(isOn: boolean): void {
		const key = isOn ? 'on' : 'off';

		this.node[key](Input.EventType.TOUCH_MOVE, this.onMove, this);
		this.node[key](Input.EventType.TOUCH_END, this.onUp, this);
		this.node[key](Input.EventType.TOUCH_CANCEL, this.onUp, this);
		this.node[key](Input.EventType.TOUCH_START, this.onDown, this);
		customEvent[key](EventType.SET_TUTOR_TARGET, this.onSetTutorTarget, this);
	}

	/* Private method to check if the ring can move based on collisions and blockers*/
	private _checkCanMove(): boolean {
		const hasRingContact = Object.keys(this._colliderComponent.contactObj).some((obj) => obj.includes('Ring'));

		if (this.hasBlockers && hasRingContact) {
			this.playSound(SoundType.Conflict);
			tween()
				.target(this.node)
				.by(0.05, { angle: 3 }, { easing: 'backOut' })
				.by(0.1, { angle: -6 }, { easing: 'backOut' })
				.by(0.05, { angle: 3 }, { easing: 'backOut' })
				.start();
			return false;
		}
		return true;
	}

	/* Public method to initiate falling of the ring*/
	public fall() {
		super.fall();
		this._toggleEventHandlers(false);
	}

	/* Event handler for touch-down*/
	private onDown(event: EventTouch) {
		customEvent.emit(EventType.ON_DOWN);

		this._canMove = this._checkCanMove();
		this._startTouchPos = event.getUILocation();
		this._startMoveAngle = this.node.angle;
		this._startTouchAngle =
			Math.atan2(this._startTouchPos.y - this._centerPos.y, this._startTouchPos.x - this._centerPos.x) *
			(180 / Math.PI);
	}

	/* Event handler for touch-move*/
	private onMove(event: EventTouch) {
		customEvent.emit(EventType.ON_MOVE);

		if (!this._canMove) return;
		if (this._startTouchPos) {
			this._currentPos = event.getUILocation();
			const angle =
				Math.atan2(this._currentPos.y - this._centerPos.y, this._currentPos.x - this._centerPos.x) *
				(180 / Math.PI);

			this.node.angle = this._startMoveAngle + angle - this._startTouchAngle;
		}
	}

	/* Event handler for touch-up*/
	private onUp() {
		customEvent.emit(EventType.ON_UP);
		this._startTouchPos = null;
	}

	/* Event handler to set tutor target*/
	private onSetTutorTarget(callback: Function) {
		const contacts = Object.keys(this._colliderComponent.contactObj).length;
		if (this.blockers.children.length === 0) {
			callback(this.node.position.clone(), contacts);
		}
	}
}
