import fs from 'fs';

/**
 * Converts colossus_central.yml from category: Map to category: Grid
 * so Content.MapRenderer can render it as a standalone grid.
 *
 * @param {string} inputFile Path to input YAML
 * @param {string} [outputFile] Path to output YAML (defaults to inputFile)
 * @returns {boolean} True if converted or already grid, false on error
 */
export function convertColossusToGrid(inputFile, outputFile) {
	if (!fs.existsSync(inputFile)) {
		console.warn(`File not found: ${inputFile}`);
		return false;
	}

	let content = fs.readFileSync(inputFile, 'utf-8');

	if (!content.includes('category: Map')) {
		console.log(`${inputFile} is already not category: Map`);
		if (outputFile && outputFile !== inputFile) {
			fs.writeFileSync(outputFile, content, 'utf-8');
		}
		return true;
	}

	// 1. Change category: Map to category: Grid
	content = content.replace('category: Map', 'category: Grid');

	// 2. Clear maps array and make grid 2 an orphan
	content = content.replace(
		/maps:\s*\r?\n-\s*1\s*\r?\ngrids:\s*\r?\n-\s*2\s*\r?\norphans:\s*\[\]/,
		'maps: []\r\ngrids:\r\n- 2\r\norphans:\r\n- 2'
	);

	// 3. Remove entity 1 (the Map entity)
	const ent1Start = content.indexOf('  - uid: 1');
	const ent2Start = content.indexOf('  - uid: 2');
	if (ent1Start !== -1 && ent2Start !== -1) {
		content = content.slice(0, ent1Start) + content.slice(ent2Start);
	}

	// 4. Set parent of grid 2 to invalid
	content = content.replace(
		/(\s*-\s*uid:\s*2[\s\S]*?-\s*type:\s*Transform[\s\S]*?parent:\s*)1/,
		(m, p) => p + 'invalid'
	);

	// 5. Decrement entity count by 1
	content = content.replace(/entityCount:\s*10483/, 'entityCount: 10482');

	// 6. Replace any remaining references to parent: 1 with parent: invalid
	content = content.replace(/(\r?\n\s+parent:\s*)1(\r?\n)/g, (m, p1, p2) => p1 + 'invalid' + p2);

	const dest = outputFile || inputFile;
	fs.writeFileSync(dest, content, 'utf-8');
	console.log(`✓ Converted ${inputFile} -> ${dest} (category: Grid)`);
	return true;
}

const args = process.argv.slice(2);
if (args.length > 0) {
	const ok = convertColossusToGrid(args[0], args[1]);
	if (!ok) process.exit(1);
}
