import { _decorator, Component, Enum, instantiate, Node, NodePool, Prefab } from 'cc';
import GameObjectType from '../Enums/GameObjectType';

const { ccclass } = _decorator;

Enum(GameObjectType);

@ccclass('ObjectPool')
export class ObjectPool extends Component {
	public pool = new NodePool();
	public createObj: Node = null;
	private _pools: {} = {};

	public initPool(prefab: Prefab, type: string) {
		if (!this._pools[type]) {
			this._pools[type] = new NodePool();
		}
		this._pools[type].put(instantiate(prefab));
	}

	/*  settle the pools for different types of prefab*/
	public getPrefabPool(type: string) {
		let pool = this._pools[type];
		if (pool.size() > 0) {
			this.createObj = pool.get();
		} else {
			this.createObj = instantiate(this.createObj);
		}
		return this.createObj;
	}

	/*  return node back to pool*/
	public putBackToPool(type: string, node: Node) {
		if (this._pools[type]) {
			this._pools[type].put(node);
		}
	}

	/*  clear node back to pool*/
	public reset() {
		for (let poolType in this._pools) {
			const pool = this._pools[poolType];
			pool.clear();
		}
	}
}
