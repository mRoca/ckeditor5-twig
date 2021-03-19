import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ExpressionEditing from './expression/expressionediting';
import StatementEditing from './statement/statementediting';
import InsertTwigStatementCommand from './statement/insertstatementcommand';
import CommentEditing from './comment/commentediting';
import InsertTwigExpressionCommand from './expression/insertexpressioncommand';
import InsertTwigCommentCommand from './comment/insertcommentcommand';
import DisplayTwigVariablesCommand from './variables/displayvariablescommand';
import DisplayTwigAvailableStatementsCommand from './statement/displaystatementscommand';
import InsertTwigImageCommand from './image/insertimagecommand';

export default class TwigPluginEditing extends Plugin {
    static get requires() {
        return [ Widget, ExpressionEditing, StatementEditing, CommentEditing ];
    }

    init() {
        this.editor.commands.add( 'displayTwigVariables', new DisplayTwigVariablesCommand( this.editor ) );
        this.editor.commands.add( 'insertTwigComment', new InsertTwigCommentCommand( this.editor ) );
        this.editor.commands.add( 'insertTwigExpression', new InsertTwigExpressionCommand( this.editor ) );
        this.editor.commands.add( 'insertTwigStatement', new InsertTwigStatementCommand( this.editor ) );
        this.editor.commands.add( 'displayTwigStatements', new DisplayTwigAvailableStatementsCommand( this.editor ) );
        this.editor.commands.add( 'insertTwigImage', new InsertTwigImageCommand( this.editor ) );
    }
}
