import { writable } from 'svelte/store';
import { solveSudoku } from '@sudoku/sudoku';

function createSolution() {
	const solution = writable([
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
	]);

	let isCalculating = false;

	return {
		subscribe: solution.subscribe,

		// 设置正确答案
		setSolution(puzzle) {
			if (isCalculating) {
				console.log('正在计算中，跳过重复计算');
				return;
			}

			try {
				isCalculating = true;
				console.log('开始计算正确答案...');
				
				// 检查puzzle是否有效
				if (!puzzle || !Array.isArray(puzzle) || puzzle.length !== 9) {
					console.error('无效的puzzle数据');
					return;
				}

				// 设置超时，避免无限计算
				const timeoutPromise = new Promise((_, reject) => {
					setTimeout(() => reject(new Error('计算超时')), 5000);
				});

				const solvePromise = new Promise((resolve) => {
					const solved = solveSudoku(puzzle);
					resolve(solved);
				});

				Promise.race([solvePromise, timeoutPromise])
					.then((solved) => {
						if (solved && Array.isArray(solved)) {
							solution.set(solved);
							console.log('正确答案计算完成');
						} else {
							console.error('solveSudoku返回无效结果');
						}
					})
					.catch((error) => {
						console.error('计算正确答案时出错:', error);
					})
					.finally(() => {
						isCalculating = false;
					});

			} catch (error) {
				console.error('setSolution执行出错:', error);
				isCalculating = false;
			}
		},

		// 获取指定位置的正确答案
		getCorrectValue(solutionStore, x, y) {
			if (!solutionStore || !Array.isArray(solutionStore) || y >= solutionStore.length) {
				return 0;
			}
			const row = solutionStore[y];
			if (!Array.isArray(row) || x >= row.length) {
				return 0;
			}
			return row[x] || 0;
		},

		// 检查用户填入的数字是否正确
		isCorrect(solutionStore, userValue, x, y) {
			if (userValue === 0) return true; // 空位置不算错误
			
			const correctValue = this.getCorrectValue(solutionStore, x, y);
			return userValue === correctValue;
		}
	};
}

export const solution = createSolution(); 