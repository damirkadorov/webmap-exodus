// Static server for comparing design builds: node scripts/serve-dir.mjs <dir> <port>
// Serves <dir> under the production base path /webmap-exodus/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const [, , dirArg, portArg] = process.argv;
if (!dirArg || !portArg) {
	console.error('Usage: node scripts/serve-dir.mjs <dir> <port>');
	process.exit(1);
}

const root = path.resolve(dirArg);
const port = Number(portArg);
const base = '/webmap-exodus';

const mime = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.txt': 'text/plain; charset=utf-8'
};

http
	.createServer((req, res) => {
		let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
		if (urlPath.startsWith(base)) urlPath = urlPath.slice(base.length) || '/';

		let filePath = path.join(root, urlPath);
		try {
			if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
		} catch {
			// keep the original path; readFile below reports the 404
		}

		fs.readFile(filePath, (err, data) => {
			if (err) {
				res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
				res.end('Not found');
				return;
			}
			res.writeHead(200, {
				'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream'
			});
			res.end(data);
		});
	})
	.listen(port, () => {
		console.log(`Serving ${root} at http://localhost:${port}${base}/`);
	});
