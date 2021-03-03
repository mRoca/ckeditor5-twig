import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { add } from '@ckeditor/ckeditor5-utils/src/translation-service';

export default class TwigPluginUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		add( 'en', {
			'Statement': 'Statement'
		} );

		add( 'fr', {
			'Statement': 'Statement'
		} );

		editor.ui.componentFactory.add( 'twigStatement', locale => {
			const command = editor.commands.get( 'insertTwigStatement' );
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Statement' ),
				withText: true,
				tooltip: true
			} );

			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			this.listenTo( buttonView, 'execute', () => editor.execute( 'insertTwigStatement' ) );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'twigStatementWithContent', locale => {
			const command = editor.commands.get( 'insertTwigStatementWithContent' );
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Statement with content' ),
				withText: true,
				tooltip: true
			} );

			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			this.listenTo( buttonView, 'execute', () => editor.execute( 'insertTwigStatementWithContent' ) );

			return buttonView;
		} );
	}
}
