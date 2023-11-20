import { _decorator, Component, Node } from 'cc';
import { customEvent, EventType } from '../Enums/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('RestartButton')
export class RestartButton extends Component {
	start() {
		this.node.on(Node.EventType.TOUCH_START, this.onDown, this);
	}

	onDown() {
		customEvent.emit(EventType.LEVEL_RESTART);
	}
}
