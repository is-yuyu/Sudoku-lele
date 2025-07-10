<script>
	import { modal } from '@sudoku/stores/modal';

	export let hideModal;

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

	function openWikiStrategy(strategy) {
		modal.show('wikiStrategy', {
			strategy: strategy,
			onHide: () => {
				// 返回策略学习页面
				modal.show('strategyLearning', {
					onHide: hideModal
				});
			}
		});
	}
</script>

<div class="flex justify-between items-center mb-6">
	<h1 class="text-3xl font-semibold leading-none">策略学习</h1>
	<div class="cursor-pointer" on:click={hideModal}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
		</svg>
	</div>
</div>

<div class="mb-4">
	<p class="text-gray-600 mb-4">学习数独解题策略，提升解题能力。点击策略名称查看详细说明。</p>
</div>

<div class="space-y-4">
	{#each strategies as strategy}
		<div class="border rounded-lg p-4 hover:bg-gray-50">
			<div class="flex justify-between items-start mb-2">
				<h3 class="text-lg font-semibold text-blue-600 cursor-pointer hover:underline" 
					on:click={() => openWikiStrategy(strategy)}>
					{strategy.name}
				</h3>
				<span class="text-xs px-2 py-1 rounded bg-gray-200">{strategy.difficulty}</span>
			</div>
			<p class="text-gray-700 mb-2">{strategy.description}</p>
			<p class="text-sm text-gray-600 italic">示例：{strategy.example}</p>
		</div>
	{/each}
</div>

<div class="mt-6 text-center">
	<p class="text-sm text-gray-500">
		更多策略请访问 
		<a href="https://www.sudokuwiki.org/Sudoku.htm" target="_blank" class="text-blue-600 hover:underline">
			SudokuWiki.org
		</a>
	</p>
</div> 