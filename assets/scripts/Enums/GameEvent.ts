import { Enum, EventTarget } from 'cc';

export const customEvent = new EventTarget();
const eventType = {
	None: 0,
	CREATE_GAME_OBJECT: 10,
	DESTROY_GAME_OBJECT: 20,
	ON_DOWN: 30,
	ON_UP: 40,
	ON_MOVE: 50,
	SET_TUTOR_TARGET: 60,
	TUTOR_ENABLE: 70,
};
export const EventType = Enum(eventType);
