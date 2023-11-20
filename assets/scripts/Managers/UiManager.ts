import { _decorator, CCFloat, Component, Node, ProgressBar, tween, UIOpacity } from 'cc';
import { Tutorial } from '../Ui/Tutorial';
const { ccclass, property } = _decorator;

@ccclass('UiManager')
export class UiManager extends Component {
	@property({ type: Node, tooltip: 'The result node' })
	result: Node = null;

	@property({ type: Node, tooltip: 'The button for the next level' })
	nextLevelButton: Node = null;

	@property({ type: Tutorial, tooltip: 'Tutorial instance' })
	tutor: Tutorial = null;

	@property({ type: CCFloat, tooltip: 'Time for tween to show or hide result' })
	timeShow = 0;

	@property({ type: ProgressBar, tooltip: 'ProgressBar when loading assets' })
	loader: ProgressBar = null;
	private _resultOpacity: UIOpacity = null;

	protected onEnable(): void {
		this.result.active = false;
		this._resultOpacity = this.result.getComponent(UIOpacity) || this.result.addComponent(UIOpacity);
		this._resultOpacity.opacity = 0;
	}

	/**
	 * toggleResult
	 */
	public toggleResult(isActive: boolean, isNext?: boolean) {
		const opacity = isActive ? 255 : 0;
		if (isActive) this.result.active = true;
		if (!isNext && this.nextLevelButton) this.nextLevelButton.active = false;
		tween()
			.target(this._resultOpacity)
			.to(this.timeShow, { opacity: opacity })
			.call(() => {
				if (!isActive) this.result.active = false;
			})
			.start();
	}
}
