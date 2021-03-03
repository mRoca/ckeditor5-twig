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

		const addButton = ( componentName, commandName, buttonLabel ) => {
			editor.ui.componentFactory.add( componentName, locale => {
				const command = editor.commands.get( commandName );
				const buttonView = new ButtonView( locale );

				buttonView.set( {
					label: t( buttonLabel ),
					withText: true,
					tooltip: true
				} );

				buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

				this.listenTo( buttonView, 'execute', () => editor.execute( commandName ) );

				return buttonView;
			} );
		};

		addButton( 'twigComment', 'insertTwigExpression', 'Comment' );
		addButton( 'twigExpression', 'insertTwigExpression', 'Expression' );
		addButton( 'twigStatement', 'insertTwigStatement', 'Statement' );
		addButton( 'twigStatementWithContent', 'insertTwigStatementWithContent', 'Statement with content' );
	}
}
