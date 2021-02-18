import TwigPluginEditing from './twigpluginediting';
import TwigPluginUI from './twigpluginui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TwigDataProcessor from './twigdataprocessor';

export default class TwigPlugin extends Plugin {
	constructor( editor ) {
		super( editor );

		editor.data.processor = new TwigDataProcessor( editor.data.viewDocument );
	}

	static get requires() {
		return [ TwigPluginEditing, TwigPluginUI ];
	}
}
