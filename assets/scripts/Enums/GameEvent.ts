import { Enum, EventTarget } from 'cc';

export const customEvent = new EventTarget();
const eventType = {
	None: 0,
	ON_DOWN: 10,
	ON_UP: 20,
	ON_MOVE: 30,
	SET_TUTOR_TARGET: 40,
	TUTOR_ENABLE: 50,
	LEVEL_RESTART: 60,
	LEVEL_NEXT: 70,
};
export const EventType = Enum(eventType);
