import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ExpressionEditing from './plugins/expressionediting';
import StatementEditing from './plugins/statementediting';
import { InsertTwigStatementCommand, InsertTwigStatementWithContentCommand } from './plugins/statementinsertcommand';
import CommentEditing from './plugins/commentediting';
import { InsertTwigExpressionCommand } from './plugins/expressioninsertcommand';
import { InsertTwigCommentCommand } from './plugins/commentinsertcommand';
import { DisplayTwigVariablesCommand } from './plugins/displayvariablescommand';
import { DisplayTwigAvailableStatementsCommand } from './plugins/displaystatementscommand';

export default class TwigPluginEditing extends Plugin {
	static get requires() {
		return [ Widget, ExpressionEditing, StatementEditing, CommentEditing ];
	}

	init() {
		this.editor.commands.add( 'displayTwigVariables', new DisplayTwigVariablesCommand( this.editor ) );
		this.editor.commands.add( 'displayTwigStatements', new DisplayTwigAvailableStatementsCommand( this.editor ) );
		this.editor.commands.add( 'insertTwigComment', new InsertTwigCommentCommand( this.editor ) );
		this.editor.commands.add( 'insertTwigExpression', new InsertTwigExpressionCommand( this.editor ) );
		this.editor.commands.add( 'insertTwigStatement', new InsertTwigStatementCommand( this.editor ) );
		this.editor.commands.add( 'insertTwigStatementWithContent', new InsertTwigStatementWithContentCommand( this.editor ) );
	}
}
