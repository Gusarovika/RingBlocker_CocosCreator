import { _decorator, Component, Collider2D, Contact2DType, RigidBody2D, IPhysics2DContact, Node } from 'cc';
import { GameObject } from '../GameObjects/GameObject';
import { EventType, customEvent } from '../Enums/GameEvent';
import { Ring } from '../GameObjects/Ring';
const { ccclass, property } = _decorator;

@ccclass('ColliderComponent')
export class ColliderComponent extends Component {
	/* private variables*/
	private _countContact: number = 0;
	private _colliders: Collider2D[] = [];
	private _gameObject: GameObject | Ring = null;

	/* object to track contact counts per node*/
	public contactObj: {} = {};

	protected onLoad() {
		/* get child colliders and determine the type of GameObject*/
		this._colliders = this.getComponentsInChildren(Collider2D);
		if (this.node.getComponent(Ring)) {
			this._gameObject = this.getComponent(Ring);
		} else {
			this._gameObject = this.getComponent(GameObject);
		}
		/* enable collision listeners*/
		this._toggleCollisionListener(true);
	}

	/* private method to toggle collision listeners on or off*/
	private _toggleCollisionListener(isOn) {
		const func = isOn ? 'on' : 'off';

		/* add or remove collision listeners for each child collider*/
		this._colliders.forEach((childCollider) => {
			childCollider[func](Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
			childCollider[func](Contact2DType.END_CONTACT, this.onEndContact, this);
		});
	}

	/* collider contact handlers*/
	private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
		/* Update contact count and track the contacted node and count*/
		this._countContact += 1;
		if (this.contactObj[otherCollider.node.name]) {
			this.contactObj[otherCollider.node.name] += 1;
		} else this.contactObj[otherCollider.node.name] = 1;
	}

	private onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
		/* update contact count and remove the contacted node if no longer in contact*/
		this._countContact -= 1;
		this.contactObj[otherCollider.node.name] -= 1;
		if (this.contactObj[otherCollider.node.name] === 0) delete this.contactObj[otherCollider.node.name];

		/* if there are no more contacts, disable collision listeners, trigger tutorial, and initiate falling*/
		if (this._countContact === 0) {
			this._toggleCollisionListener(false);
			customEvent.emit(EventType.TUTOR_ENABLE);
			this._gameObject.fall();
		}
	}
}
