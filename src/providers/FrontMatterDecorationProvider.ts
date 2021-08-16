import { TextEditorDecorationType, window, ColorThemeKind } from "vscode";

export class FrontMatterDecorationProvider {

  get(): TextEditorDecorationType {
    const colorThemeKind = window.activeColorTheme.kind;

    return window.createTextEditorDecorationType({
      backgroundColor: colorThemeKind === ColorThemeKind.Dark ? "#ffffff14" : "#00000014",
      isWholeLine: true,
    });
  }
}