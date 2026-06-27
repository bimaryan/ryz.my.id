fetch('https://ej2.syncfusion.com/react/demos/src/document-editor/default.tsx')
  .then(r => r.text())
  .then(t => {
    const lines = t.split('\n');
    lines.forEach(line => {
      if(line.includes('serviceUrl')) {
        console.log(line);
      }
    });
  })
  .catch(console.error);
