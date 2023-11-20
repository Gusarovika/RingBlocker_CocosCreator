import { _decorator, Component, PhysicsSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PhysicsManager')
export class PhysicsManager extends Component {
	@property({
		tooltip: 'Enable or disable physics for the scene',
	})
	isEnablePhysics: boolean = false;

	/*  enable physics engine*/
	protected onLoad(): void {
		PhysicsSystem2D.instance.enable = this.isEnablePhysics;
	}
}
