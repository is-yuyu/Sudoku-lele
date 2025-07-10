<script>
	import { modal } from '@sudoku/stores/modal';
	import { userGrid } from '@sudoku/stores/grid';

	export let data = {};
	export let hideModal;

	let loading = false;
	let error = '';
	let customUrl = '';

	// 预设的题目分类
	const puzzleCategories = [
		{
			name: '基础练习',
			difficulty: '简单',
			description: '适合初学者的基础题目',
			puzzles: [
				{ name: '基础题目1', url: 'https://www.sudokuwiki.org/sudoku.htm?bd=000000000000000000000000000000000000000000000000000000000000000000000000000000000' },
				{ name: '基础题目2', url: 'https://www.sudokuwiki.org/sudoku.htm?bd=000000000000000000000000000000000000000000000000000000000000000000000000000000000' }
			]
		},
		{
			name: '隐藏单数',
			difficulty: '简单',
			description: '练习隐藏单数技巧的题目',
			puzzles: [
				{ name: '隐藏单数1', url: 'https://www.sudokuwiki.org/sudoku.htm?bd=000000000000000000000000000000000000000000000000000000000000000000000000000000000' },
				{ name: '隐藏单数2', url: 'https://www.sudokuwiki.org/sudoku.htm?bd=000000000000000000000000000000000000000000000000000000000000000000000000000000000' }
			]
		},
		{
			name: '数对技巧',
			difficulty: '中等',
			description: '练习数对和数三技巧的题目',
			puzzles: [
				{ name: '数对题目1', url: 'https://www.sudokuwiki.org/sudoku.htm?bd=000000000000000000000000000000000000000000000000000000000000000000000000000000000' },
				{ name: '数对题目2', url: 'https://www.sudokuwiki.org/sudoku.htm?bd=000000000000000000000000000000000000000000000000000000000000000000000000000000000' }
			]
		}
	];

	function goBack() {
		if (data.onHide) {
			data.onHide();
		} else {
			hideModal();
		}
	}

	async function loadPuzzle(puzzle) {
		try {
			const res = await fetch(puzzle.url);
			const html = await res.text();
			
			// 解析棋盘数据
			const match = html.match(/var puzzle = \"([0-9\.]{81})\"/);
			if (!match) {
				error = '未找到有效棋盘数据';
				return;
			}
			
			const puzzleData = match[1].replace(/\./g, '0').split('').map(Number);
			if (puzzleData.length !== 81) {
				error = '棋盘数据长度不正确';
				return;
			}
			
			// 加载到棋盘
			for (let y = 0; y < 9; y++) {
				for (let x = 0; x < 9; x++) {
					userGrid.set({ x, y }, puzzleData[y * 9 + x]);
				}
			}
			
			hideModal();
			alert(`成功导入题目：${puzzle.name}`);
		} catch (e) {
			error = '导入题目失败';
		}
	}

	async function importFromUrl() {
		if (!customUrl.trim()) {
			alert('请输入有效的URL或字符串');
			return;
		}

		// 1. 先尝试bd参数
		const bdMatch = customUrl.match(/[?&]bd=([0-9.]{81})/i);
		if (bdMatch) {
			return importBdString(bdMatch[1]);
		}

		// 2. 直接粘贴的81位字符串
		const str = customUrl.replace(/[^0-9.]/g, '');
		if (str.length === 81) {
			return importBdString(str);
		}

		// 3. fetch网页源码
		try {
			const res = await fetch(customUrl);
			const html = await res.text();

			// 3.1 var puzzle = "..."
			const match = html.match(/var puzzle = "([0-9.]{81})"/);
			if (match) {
				return importBdString(match[1]);
			}

			// 3.2 解析表格（如Daily_Sudoku页面）
			const tableMatch = html.match(/<table[^>]*id=["']?puzzle_grid["']?[^>]*>([\s\S]*?)<\/table>/i);
			if (tableMatch) {
				const cellMatches = tableMatch[1].match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
				if (cellMatches && cellMatches.length === 81) {
					const numbers = cellMatches.map(td => {
						const num = td.replace(/<[^>]+>/g, '').trim();
						return num === '' || num === '.' ? 0 : Number(num);
					});
					return importBdArray(numbers);
				}
			}

			alert('未找到有效棋盘数据');
		} catch (e) {
			alert('导入失败，请检查URL是否正确');
		}
	}

	function importBdString(bd) {
		const arr = bd.replace(/\./g, '0').split('').map(Number);
		for (let y = 0; y < 9; y++) {
			for (let x = 0; x < 9; x++) {
				userGrid.set({ x, y }, arr[y * 9 + x]);
			}
		}
		hideModal();
		alert('成功导入题目！');
	}

	function importBdArray(arr) {
		for (let y = 0; y < 9; y++) {
			for (let x = 0; x < 9; x++) {
				userGrid.set({ x, y }, arr[y * 9 + x]);
			}
		}
		hideModal();
		alert('成功导入题目！');
	}
</script>

<div class="flex justify-between items-center mb-6">
	<h1 class="text-3xl font-semibold leading-none">SudokuWiki题库</h1>
	<div class="cursor-pointer" on:click={hideModal}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
		</svg>
	</div>
</div>

<div class="mb-4">
	<p class="text-gray-600 mb-4">浏览SudokuWiki题库，选择适合的题目进行练习。</p>
	<button class="btn btn-secondary mb-4" on:click={goBack}>
		← 返回策略学习
	</button>
</div>

<div class="space-y-4">
	{#each puzzleCategories as category}
		<div class="border rounded-lg p-4 hover:bg-gray-50">
			<div class="flex justify-between items-start mb-2">
				<h3 class="text-lg font-semibold text-green-600">{category.name}</h3>
				<span class="text-xs px-2 py-1 rounded bg-gray-200">{category.difficulty}</span>
			</div>
			<p class="text-gray-700 mb-2">{category.description}</p>
			<div class="flex flex-wrap gap-2">
				{#each category.puzzles as puzzle}
					<button class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200"
						on:click={() => loadPuzzle(puzzle)}>
						{puzzle.name}
					</button>
				{/each}
			</div>
		</div>
	{/each}
</div>

<div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
	<h3 class="text-lg font-semibold text-blue-800 mb-2">自定义题目导入</h3>
	<p class="text-blue-700 mb-3">从SudokuWiki URL导入题目：</p>
	<div class="flex gap-2">
		<input type="text" bind:value={customUrl} placeholder="输入SudokuWiki题目URL"
			class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
		<button class="btn btn-primary" on:click={importFromUrl}>
			导入
		</button>
	</div>
</div>

<div class="mt-6 text-center">
	<p class="text-sm text-gray-500">
		更多题目请访问 
		<a href="https://www.sudokuwiki.org/sudoku.htm" target="_blank" class="text-blue-600 hover:underline">
			SudokuWiki.org
		</a>
	</p>
</div> 