import { customEvent, EventType } from '../Enums/GameEvent';
import {
	_decorator,
	CCInteger,
	Component,
	Input,
	input,
	Node,
	sp,
	tween,
	UIOpacity,
	Skeleton,
	Enum,
	CCFloat,
	Vec3,
} from 'cc';
const { ccclass, property } = _decorator;

const skeletonEvent = Enum({
	swipe: 'swipe',
	tap: 'tap',
});

@ccclass('Tutorial')
export class Tutorial extends Component {
	@property({ type: CCInteger, tooltip: 'Time to activate the tutorial' })
	timeToActivateTutorial = 0;

	@property({ type: CCFloat, tooltip: 'Time for a move' })
	moveTime = 0;

	@property({ type: CCInteger, tooltip: 'Angle for a move' })
	moveAngle = 0;

	@property({ tooltip: 'Offset vector for tutor hand to in the  center of the target ring' })
	offset = new Vec3();
	private _isUserActive: boolean = false;
	private _inactiveTime: number = 0;
	private _tutorActive: boolean = false;
	private _skeleton: sp.Skeleton;
	private _needTutor: boolean = false;
	private _currentTarget: Vec3 = null;

	protected start() {
		customEvent.on(EventType.ON_DOWN, this.onDown, this);
		customEvent.on(EventType.ON_UP, this.onUp, this);
		customEvent.on(EventType.TUTOR_ENABLE, this.onUp, this);

		this._skeleton = this.getComponentInChildren('sp.Skeleton') as sp.Skeleton;
		this._skeleton.setCompleteListener(() => {
			this.onCompleteEvent();
		});
		this._skeleton.animation = null;

		this.getComponent(UIOpacity).opacity = 0;
	}

	protected update(deltaTime: number) {
		if (!this._needTutor) return;
		if (!this._isUserActive && !this._tutorActive) {
			this._inactiveTime += deltaTime;
			if (this._inactiveTime >= this.timeToActivateTutorial) {
				this._toggleTutor(true);
			}
		}
	}

	public activate() {
		this._needTutor = true;
	}

	private _toggleTutor(isActive: boolean) {
		this._tutorActive = isActive;
		const opacity = isActive ? 255 : 0;
		if (!isActive) {
			this._currentTarget = null;
			this._skeleton.animation = null;
		} else {
			/* get possible targets and set the correct one*/
			customEvent.emit(EventType.SET_TUTOR_TARGET, (nodePos: Vec3, contact: number) => {
				if (contact === 1) {
					this._currentTarget = nodePos;
					this.node.setPosition(nodePos.add(this.offset));
				}
				if (!this._currentTarget && contact >= 2) {
					this._currentTarget = nodePos;
					this.node.setPosition(nodePos.add(this.offset));
				}
			});
		}
		tween()
			.target(this.node.getComponent(UIOpacity))
			.to(0.5, { opacity: opacity })
			.call(() => {
				if (isActive) {
					this._skeleton.setAnimation(0, skeletonEvent.swipe, false);
					this._tweenAngle();
				}
			})
			.start();
	}

	/* make move hand with tween*/
	private _tweenAngle() {
		this._skeleton.setAnimation(0, skeletonEvent.swipe, false);

		tween()
			.target(this.node)
			.delay(this.moveTime)
			.by(this.moveTime, { angle: this.moveAngle })
			.by(this.moveTime, { angle: -this.moveAngle })
			.start();
	}

	/* event handlers*/
	private onDown() {
		this._isUserActive = true;
		this._inactiveTime = 0;
		this._toggleTutor(false);
	}

	private onUp() {
		this._isUserActive = false;
	}

	private onCompleteEvent() {
		this._tweenAngle();
	}
}
