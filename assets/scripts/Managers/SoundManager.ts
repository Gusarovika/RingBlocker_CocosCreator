import { Node, AudioSource, Component, AudioClip, _decorator, Enum } from 'cc';
import SoundType from '../Enums/SoundType';

const { ccclass, property } = _decorator;

Enum(SoundType);

@ccclass('SoundHelper')
class SoundHelper {
	@property({ type: SoundType, tooltip: 'Type of the sound' })
	type: SoundType = null;

	@property({ type: AudioClip, tooltip: 'Audio clip for the sound' })
	sound: AudioClip = null;
}

@ccclass('SoundManager')
export class SoundManager extends Component {
	@property({ type: [SoundHelper], tooltip: 'List of sounds settings for the game' })
	sounds: SoundHelper[] = [];

	private _audioSource: AudioSource;

	onLoad() {
		this._audioSource = this.addComponent(AudioSource);
	}

	public play(type: SoundType | string, volume: number = 1.0, isLong = false) {
		let params = this.sounds.find((sound) => sound.type === type);

		if (params.sound instanceof AudioClip) {
			if (isLong) {
				console.log('play long');

				this._audioSource.clip = params.sound;
				this._audioSource.play();
			} else {
				this._audioSource.playOneShot(params.sound, volume);
			}
		}
	}

	/* stop the audio play*/
	stop() {
		this._audioSource.stop();
	}

	/* pause the audio play*/
	pause() {
		this._audioSource.pause();
	}

	/* resume the audio play*/
	resume() {
		this._audioSource.play();
	}
}
