import { _decorator, Component, Node, PhysicsSystem2D, EPhysics2DDrawFlags, PhysicsSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PhysicsManager')
export class PhysicsManager extends Component {
	@property isEnablePhysics: boolean = false;
	@property({
		visible: function () {
			return this.isEnablePhysics;
		},
	})
	isDebugPhysics: boolean = false;

	/*  enable physics engine*/
	protected onLoad(): void {
		PhysicsSystem2D.instance.enable = this.isEnablePhysics;
		if (this.isDebugPhysics) {
			PhysicsSystem2D.instance.debugDrawFlags =
				EPhysics2DDrawFlags.Aabb |
				EPhysics2DDrawFlags.Pair |
				EPhysics2DDrawFlags.CenterOfMass |
				EPhysics2DDrawFlags.Joint |
				EPhysics2DDrawFlags.Shape;
		}
	}
}
