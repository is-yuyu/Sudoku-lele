<script>
	import { modal } from '@sudoku/stores/modal';

	export let data = {};
	export let hideModal;

	const strategy = data.strategy;

	function goBack() {
		if (data.onHide) {
			data.onHide();
		} else {
			hideModal();
		}
	}

	function openWikiPage() {
		window.open(strategy.wikiUrl, '_blank');
	}

	function openRelatedStrategy(relatedStrategyName) {
		// 查找相关策略
		const relatedStrategy = strategies.find(s => s.name === relatedStrategyName);
		if (relatedStrategy) {
			modal.show('wikiStrategy', {
				strategy: relatedStrategy,
				onHide: data.onHide // 始终回到策略学习页
			});
		} else {
			// 如果找不到相关策略，显示提示
			alert(`策略 "${relatedStrategyName}" 暂未收录，请访问SudokuWiki查看详细说明。`);
		}
	}

	// 策略数据（这里应该从外部传入或从store获取）
	const strategies = [
		{
			name: '隐藏单数',
			difficulty: '简单',
			description: '在行、列或宫中，某个数字只能填入一个位置。',
			example: '在某个宫中，数字5只能填入一个格子。',
			steps: [
				'检查每个宫、行、列',
				'找出只能填入一个位置的数字',
				'填入该数字'
			],
			relatedStrategies: ['裸单数', '唯一候选数'],
			practiceTips: [
				'从简单的宫开始练习',
				'注意观察候选数的分布'
			],
			wikiUrl: 'https://www.sudokuwiki.org/Hidden_Singles'
		},
		{
			name: '裸单数',
			difficulty: '简单',
			description: '某个格子只有一个候选数。',
			example: '某个格子只能填入数字3。',
			steps: [
				'检查每个格子的候选数',
				'找出只有一个候选数的格子',
				'填入该数字'
			],
			relatedStrategies: ['隐藏单数', '唯一候选数'],
			practiceTips: [
				'先完成所有裸单数',
				'再寻找隐藏单数'
			],
			wikiUrl: 'https://www.sudokuwiki.org/Naked_Singles'
		},
		{
			name: '唯一候选数',
			difficulty: '简单',
			description: '在行、列或宫中，某个候选数只出现在一个位置。',
			example: '在某个宫中，候选数7只出现在一个格子中。',
			steps: [
				'标记所有候选数',
				'检查每个宫、行、列',
				'找出唯一出现的候选数',
				'填入该数字'
			],
			relatedStrategies: ['隐藏单数', '裸单数'],
			practiceTips: [
				'系统性地检查每个区域',
				'注意候选数的唯一性'
			],
			wikiUrl: 'https://www.sudokuwiki.org/Singles'
		},
		{
			name: '裸数对',
			difficulty: '中等',
			description: '两个格子只包含相同的两个候选数。',
			example: '两个格子都只能填入数字2和5。',
			steps: [
				'检查每个宫、行、列',
				'找出只包含相同两个候选数的格子',
				'排除其他格子中的这些候选数'
			],
			relatedStrategies: ['隐藏数对', '裸数三'],
			practiceTips: [
				'注意观察候选数的组合',
				'数对可以排除其他候选数'
			],
			wikiUrl: 'https://www.sudokuwiki.org/Naked_Pairs'
		},
		{
			name: '隐藏数对',
			difficulty: '中等',
			description: '在行、列或宫中，两个候选数只出现在两个格子中。',
			example: '在某个宫中，候选数3和7只出现在两个格子中。',
			steps: [
				'检查每个宫、行、列',
				'找出只出现在两个格子中的候选数',
				'这两个格子只能填入这些候选数'
			],
			relatedStrategies: ['裸数对', '隐藏数三'],
			practiceTips: [
				'注意候选数的分布模式',
				'隐藏数对可以简化候选数'
			],
			wikiUrl: 'https://www.sudokuwiki.org/Hidden_Pairs'
		},
		{
			name: 'X-Wing',
			difficulty: '困难',
			description: '某个候选数在两行中都只出现在相同的两列中。',
			example: '候选数4在两行中都只出现在第2列和第8列。',
			steps: [
				'检查每行的候选数分布',
				'找出在两行中只出现在相同两列的候选数',
				'排除这两列中其他行的该候选数'
			],
			relatedStrategies: ['Swordfish', 'XY-Wing'],
			practiceTips: [
				'需要仔细观察候选数模式',
				'X-Wing是高级技巧的基础'
			],
			wikiUrl: 'https://www.sudokuwiki.org/X_Wing'
		}
	];
</script>

<div class="mb-4">
	<button class="btn btn-secondary mb-4" on:click={goBack}>
		← 返回策略学习
	</button>
</div>

<div>
	<div class="mb-6">
		<h2 class="text-2xl font-bold text-blue-600 mb-2">{strategy.name}</h2>
		<span class="inline-block px-3 py-1 bg-gray-200 rounded-full text-sm mb-4">
			难度：{strategy.difficulty}
		</span>
		<p class="text-gray-700 mb-4">{strategy.description}</p>
	</div>

	<div class="mb-6">
		<h3 class="text-xl font-semibold mb-3">解题步骤</h3>
		<ol class="list-decimal list-inside space-y-2 text-gray-700">
			{#each strategy.steps as step}
				<li class="pl-2">{step}</li>
			{/each}
		</ol>
	</div>

	<div class="mb-6">
		<h3 class="text-xl font-semibold mb-3">示例</h3>
		<div class="bg-gray-100 p-4 rounded-lg">
			<p class="text-gray-700 mb-2">{strategy.example}</p>
			{#if strategy.exampleBoard}
				<div class="mt-4">
					<p class="text-sm font-semibold mb-2">示例棋盘：</p>
					<div class="grid grid-cols-9 gap-px bg-gray-300 border-2 border-gray-400 max-w-xs">
						{#each strategy.exampleBoard as row, rowIndex}
							{#each row as cell, colIndex}
								<div class="w-8 h-8 bg-white flex items-center justify-center text-sm font-mono">
									{#if cell !== 0}
										{cell}
									{/if}
								</div>
							{/each}
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="mb-6">
		<h3 class="text-xl font-semibold mb-3">相关策略</h3>
		<div class="flex flex-wrap gap-2">
			{#each strategy.relatedStrategies as related}
				<button class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
					on:click={() => openRelatedStrategy(related)}>
					{related}
				</button>
			{/each}
		</div>
	</div>

	<div class="mb-6">
		<h3 class="text-xl font-semibold mb-3">练习建议</h3>
		<ul class="list-disc list-inside space-y-2 text-gray-700">
			{#each strategy.practiceTips as tip}
				<li class="pl-2">{tip}</li>
			{/each}
		</ul>
	</div>

	<div class="text-center">
		<a href="https://www.sudokuwiki.org/Sudoku.htm" target="_blank" rel="noopener noreferrer"
			class="btn btn-primary">
			🌐 在SudokuWiki查看完整说明
		</a>
	</div>
</div>

<div class="mt-6 text-center">
	<p class="text-sm text-gray-500">
		提示：在游戏中遇到此策略时，点击"下一步提示"按钮会显示相关说明。
	</p>
</div> 