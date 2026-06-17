import fs from 'fs';

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/emerald-500/g, '[#0b5cff]');
  content = content.replace(/emerald-600/g, 'blue-700');
  content = content.replace(/emerald-200/g, 'blue-200');
  content = content.replace(/emerald-50/g, 'blue-50');
  fs.writeFileSync(filePath, content);
}

replaceColors('d:/ryz.my.id/src/components/BlogEditorModal.jsx');
replaceColors('d:/ryz.my.id/src/components/ProductEditorModal.jsx');
replaceColors('d:/ryz.my.id/src/components/ChapterEditorModal.jsx');
console.log('Colors replaced successfully!');
