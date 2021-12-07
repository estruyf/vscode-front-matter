import { window, Position, TextDocumentContentProvider, Uri, workspace, WorkspaceEdit, Range, languages, ViewColumn } from "vscode";


export default class ContentProvider implements TextDocumentContentProvider {

	public static get scheme() { return "frontmatter" };

	provideTextDocumentContent(uri: Uri): string {
		return uri.query;
	}

	public static async show(data: string, title: string, outputType?: string, column: ViewColumn = ViewColumn.Beside) {
		const apiData = JSON.stringify(data, null, 2);

    const uri = Uri.parse(`${ContentProvider.scheme}:${title} output`);

		const doc = await workspace.openTextDocument(uri);

    await window.showTextDocument(doc, { preview: true, viewColumn: column, preserveFocus: true });

    const workEdits = new WorkspaceEdit();
    workEdits.replace(doc.uri, new Range(new Position(0, 0), new Position(doc.lineCount, 0)), data);
    await workspace.applyEdit(workEdits);
                
    await languages.setTextDocumentLanguage(doc, outputType || "text");
	}
}