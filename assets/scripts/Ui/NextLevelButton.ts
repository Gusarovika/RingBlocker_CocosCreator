import { _decorator, Component, find, Node } from 'cc';
import { customEvent, EventType } from '../Enums/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('NextLevelButton')
export class NextLevelButton extends Component {
	start() {
		this.node.on(Node.EventType.TOUCH_START, this.onDown, this);
	}

	onDown() {
		customEvent.emit(EventType.LEVEL_NEXT);
	}
}
