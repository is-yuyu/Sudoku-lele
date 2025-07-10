const fs = require('fs');
// const inlineCriticalCss = require('inline-critical'); // 已移除
const reaver = require('reaver');

function throwIfError(err) {
	if (err) throw err;
}

function replaceInBuffer(buf, a, b) {
	if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
	const idx = buf.indexOf(a);
	if (idx === -1) return buf;
	if (!Buffer.isBuffer(b)) b = Buffer.from(b);

	const before = buf.slice(0, idx);
	const after = replaceInBuffer(buf.slice(idx + a.length), a, b);
	const len = idx + b.length + after.length;
	return Buffer.concat([before, b, after], len);
}

// 简化后的流程：直接复制 template.html 到 dist/index.html，并处理 bundle.js hash
fs.readFile('./src/template.html', (err, templateHtml) => {
	throwIfError(err);

	// Read bundle.js
	fs.readFile('./dist/bundle.js', (err, bundleJs) => {
		throwIfError(err);

		// Calculate file hash and get filename using the hash
		const hashedBundleName = reaver.rev('bundle.js', bundleJs);

		// Replace bundle.js filename in HTML
		const outputHtml = replaceInBuffer(templateHtml, 'bundle.js', hashedBundleName);

		// Write final HTML into index.html
		fs.writeFile('./dist/index.html', outputHtml, throwIfError);

		// Rename bundle.js
		fs.rename('./dist/bundle.js', './dist/' + hashedBundleName, throwIfError);
	});
});