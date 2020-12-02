
(function () {
  const vscode = acquireVsCodeApi();

  window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.type) {
      case 'addColor':
        addColor();
        break;
      case 'clearColors':
        colors = [];
        updateColorList(colors);
        break;
    }
  });
  
  window.onload = function() {
    vscode.postMessage({ command: 'get-data' });
    console.log('Ready to accept data.');
  };
}());