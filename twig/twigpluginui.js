import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ListView from '@ckeditor/ckeditor5-ui/src/list/listview';
import { addTranslationsIfNotExist } from './utils';

export default class TwigPluginUI extends Plugin {
    static get requires() {
        return [ ];
    }

    init() {
        const editor = this.editor;
        const t = editor.t;

        addTranslationsIfNotExist( 'en', {
            'twig.commands': 'Twig commands',
            'twig.variables': 'Variables list',
            'twig.statement': 'Tag',
            'twig.statement-with-content': 'Tag with content',
            'twig.comment': 'Comment',
            'twig.expression': 'Variable',
            'twig.expression.label': 'Expression, e.g.: myVar|filter',
            'twig.expression.insert': 'Insert the expression',
            'twig.expression.required': 'You must write something',
            'twig.statements.insert': 'Insert a tag statement',
            'twig.variables.empty': 'There is no available variables for this template.',
            'twig.variables.name': 'Variable',
            'twig.variables.type': 'Type',
            'twig.variables.label': 'Description',
            'twig.variables.type.object': 'Object',
            'twig.variables.type.array': 'Array',
            'twig.variables.type.string': 'String',
            'twig.variables.type.boolean': 'Boolean',
            'twig.variables.type.integer': 'Integer',
            'twig.variables.type.float': 'Float',
            'twig.variables.type.datetime': 'Datetime',
            'twig.variables.type.unknown': 'Unknown'
        } );

        addTranslationsIfNotExist( 'fr', {
            'twig.commands': 'Commandes Twig',
            'twig.variables': 'Liste des variables',
            'twig.statement': 'Instruction',
            'twig.statement-with-content': 'Boucle / Condition / Bloc',
            'twig.comment': 'Commentaire',
            'twig.expression': 'Variable',
            'twig.expression.label': 'Variable, par exemple: maVariable|filter',
            'twig.expression.insert': 'Insérer l\'expression',
            'twig.expression.required': 'Vous devez entrer une valeur',
            'twig.statements.insert': 'Insérer un nouveau bloc',
            'twig.variables.empty': 'Aucune variable n\'est disponible pour ce template.',
            'twig.variables.name': 'Variable',
            'twig.variables.type': 'Type',
            'twig.variables.label': 'Description',
            'twig.variables.type.object': 'Objet',
            'twig.variables.type.array': 'Tableau',
            'twig.variables.type.string': 'Chaîne',
            'twig.variables.type.boolean': 'Booléen',
            'twig.variables.type.integer': 'Nombre entier',
            'twig.variables.type.float': 'Nombre à virgule',
            'twig.variables.type.datetime': 'Date et heure',
            'twig.variables.type.unknown': 'Inconnu'
        } );

        editor.ui.componentFactory.add( 'twigCommands', locale => {
            const dropdownView = createDropdown( locale );
            dropdownView.buttonView.set( {
                withText: true,
                label: t( 'twig.commands' )
            } );

            const createDropdownButton = ( commandName, buttonLabel, buttonClass ) => {
                const buttonView = new ButtonView( locale );

                buttonView.set( { label: t( buttonLabel ), withText: true } );

                if ( buttonClass ) {
                    buttonView.set( { class: buttonClass } );
                }

                const command = editor.commands.get( commandName );
                buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
                this.listenTo( buttonView, 'execute', () => {
                    editor.execute( commandName );
                    editor.editing.view.focus();
                } );

                return buttonView;
            };

            const listView = dropdownView.listView = new ListView( locale );

            listView.items.add( createDropdownButton( 'displayTwigVariables', 'twig.variables' ) );
            listView.items.add( createDropdownButton( 'insertTwigComment', 'twig.comment' ) );
            listView.items.add( createDropdownButton( 'insertTwigExpression', 'twig.expression' ) );
            listView.items.add( createDropdownButton( 'insertTwigStatement', 'twig.statement' ) );
            listView.items.add( createDropdownButton( 'displayTwigStatements', 'twig.statement-with-content' ) );

            dropdownView.bind( 'isEnabled' ).toMany( listView.items, 'isEnabled',
                ( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
            );

            dropdownView.panelView.children.add( listView );
            listView.items.delegate( 'execute' ).to( dropdownView );

            return dropdownView;
        } );
    }
}
