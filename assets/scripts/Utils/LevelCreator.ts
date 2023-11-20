import { _decorator, Component, Node } from 'cc';
import { GameObject } from '../GameObjects/GameObject';
import GameObjectType from '../Enums/GameObjectType';
import ColorType from '../Enums/ColorType';

const { ccclass, property } = _decorator;

interface Level {
	type: string;
	color: string;
	x: number;
	y: number;
	angle: number;
	path: string;
	imagePath: string;
	blockers?: number[];
	blockerPrefabPath?: string;
	blockerPath?: string;
}

@ccclass('Rings')
export class Rings extends Component {
	@property({ type: Node, tooltip: 'the node that must contain only gameobjects for the download' })
	ringHolder: Node = null;
	@property({ type: Node, tooltip: 'will download json with the level setting' }) downloadBtn: Node = null;

	private _rings: Node[] = [];

	protected start() {
		if (this.downloadBtn) {
			this.downloadBtn.on(Node.EventType.TOUCH_START, this.onDown, this);
		}
		if (this.ringHolder) this._rings = this.ringHolder.children;
	}

	/*  set all the parameters for making a json file*/
	private _downLoadJson() {
		const ringPositions = this._rings.map((node) => {
			const go = node.getComponent(GameObject);
			if (go) {
				const type = GameObjectType[go.type];
				const color = ColorType[go.color];
				const x = Math.floor(node.position.x);
				const y = Math.floor(node.position.y);
				const angle = Math.floor(node.angle);
				const path = `prefabs/${type}`;
				const imagePath = `images/${type.toLowerCase()}/${type.toLowerCase()}_${color.toLowerCase()}/spriteFrame`;
				const blockers = go.blockers ? go.blockers.children.map((node) => node.angle) : [];
				const blockerPrefabPath = 'prefabs/SingleBlocker';

				const blockerPath = `images/blockers_single/single_blocker_${color.toLowerCase()}/spriteFrame`;

				let level: Level = {
					type: type,
					color: color,
					x: x,
					y: y,
					angle: angle,
					path: path,
					imagePath: imagePath,
				};
				if (blockers.length > 0) {
					level.blockers = blockers;
					level.blockerPrefabPath = blockerPrefabPath;
					level.blockerPath = blockerPath;
				}

				return level;
			}
		});
		const content = JSON.stringify(ringPositions);

		let downloadElement = document.createElement('a');
		let file = new Blob([content], { type: 'application/json' });

		downloadElement.href = URL.createObjectURL(file);

		const name = 'LevelRings.json';

		downloadElement.download = name;
		downloadElement.click();
	}

	private onDown(): void {
		this._downLoadJson();
	}
}
