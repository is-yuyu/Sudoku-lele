// 策略引擎：依次调用各策略，返回第一个可用提示
import { NakedSingleStrategy, HiddenSingleStrategy, PointingPairsStrategy } from './Strategy.js';

export default class StrategyEngine {
    constructor() {
        // 策略优先级顺序（从简单到复杂，只保留最可靠的策略）
        this.strategies = [
            new NakedSingleStrategy(),
            new HiddenSingleStrategy(),
            new PointingPairsStrategy()
        ];
    }

    // 获取下一步提示
    getNextHint(board) {
        // 首先验证棋盘是否合法
        if (!this.validateBoard(board)) {
            console.error('棋盘状态不合法，无法提供提示');
            return null;
        }

        for (const strategy of this.strategies) {
            console.log(`Trying strategy: ${strategy.constructor.name}`);
            const hint = strategy.analyze(board);
            if (hint) {
                // 严格验证提示的有效性
                if (this.strictValidateHint(board, hint)) {
                    hint.strategy = strategy.constructor.name;
                    console.log(`Found valid hint with strategy: ${strategy.constructor.name}`, hint);
                    return hint;
                } else {
                    console.log(`Invalid hint found, skipping:`, hint);
                }
            }
        }
        console.log('No valid hints found');
        return null;
    }

    // 验证棋盘是否合法
    validateBoard(board) {
        if (!board || !board.cells || !Array.isArray(board.cells)) {
            return false;
        }

        // 检查是否有冲突
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = board.cells[row][col].value;
                if (value !== 0) {
                    // 临时清空该位置
                    const originalValue = board.cells[row][col].value;
                    board.cells[row][col].value = 0;
                    
                    // 检查是否可以放回该数字
                    const canPlace = this.isValidPlacement(board, row, col, originalValue);
                    
                    // 恢复原值
                    board.cells[row][col].value = originalValue;
                    
                    if (!canPlace) {
                        console.error(`棋盘冲突：位置 (${row + 1}, ${col + 1}) 的数字 ${originalValue} 与现有数字冲突`);
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // 严格验证提示的有效性
    strictValidateHint(board, hint) {
        try {
            if (hint.type === 'Naked Single' || hint.type === 'Hidden Single') {
                return this.validateSingleHint(board, hint);
            } else if (hint.type === 'Pointing Pairs') {
                return this.validatePointingPairsHint(board, hint);
            }
            return false; // 未知策略类型
        } catch (error) {
            console.error('验证提示时出错:', error);
            return false;
        }
    }

    // 验证Single类型提示
    validateSingleHint(board, hint) {
        const { row, col } = hint.cell;
        const value = hint.value;
        
        // 1. 检查该位置是否为空
        if (board.cells[row][col].value !== 0) {
            console.error(`位置 (${row + 1}, ${col + 1}) 已有数字 ${board.cells[row][col].value}`);
            return false;
        }
        
        // 2. 检查该数字是否真的可以放在该位置
        if (!this.isValidPlacement(board, row, col, value)) {
            console.error(`数字 ${value} 不能放在位置 (${row + 1}, ${col + 1})`);
            return false;
        }
        
        // 3. 验证候选数计算
        const candidates = this.calculateCandidates(board, row, col);
        if (hint.type === 'Naked Single') {
            if (candidates.length !== 1 || candidates[0] !== value) {
                console.error(`Naked Single验证失败：候选数为 [${candidates.join(',')}]，但提示值为 ${value}`);
                return false;
            }
        } else if (hint.type === 'Hidden Single') {
            // 验证该数字是否真的只能放在这个位置
            const otherPositions = this.findOtherPositionsForValue(board, row, col, value);
            if (otherPositions.length > 0) {
                console.error(`Hidden Single验证失败：数字 ${value} 还可以放在其他位置:`, otherPositions);
                return false;
            }
        }
        
        return true;
    }

    // 验证Pointing Pairs提示
    validatePointingPairsHint(board, hint) {
        const { row, col } = hint.cell;
        const value = hint.value;
        
        // 1. 检查主要格子是否为空
        if (board.cells[row][col].value !== 0) {
            console.error(`主要格子 (${row + 1}, ${col + 1}) 已有数字`);
            return false;
        }
        
        // 2. 检查该数字是否可以在主要格子中
        if (!this.isValidPlacement(board, row, col, value)) {
            console.error(`数字 ${value} 不能放在主要格子 (${row + 1}, ${col + 1})`);
            return false;
        }
        
        // 3. 验证排除的位置
        if (!hint.eliminate || hint.eliminate.length === 0) {
            console.error('Pointing Pairs没有提供排除位置');
            return false;
        }
        
        for (const elim of hint.eliminate) {
            if (board.cells[elim.row][elim.col].value !== 0) {
                console.error(`排除位置 (${elim.row + 1}, ${elim.col + 1}) 已有数字`);
                return false;
            }
            if (!this.isValidPlacement(board, elim.row, elim.col, value)) {
                console.error(`排除位置 (${elim.row + 1}, ${elim.col + 1}) 本来就不能放数字 ${value}`);
                return false;
            }
        }
        
        return true;
    }

    // 计算指定位置的候选数
    calculateCandidates(board, row, col) {
        const candidates = [];
        
        if (board.cells[row][col].value !== 0) {
            return candidates;
        }
        
        for (let n = 1; n <= 9; n++) {
            if (this.isValidPlacement(board, row, col, n)) {
                candidates.push(n);
            }
        }
        
        return candidates;
    }

    // 查找某个数字的其他可能位置
    findOtherPositionsForValue(board, excludeRow, excludeCol, value) {
        const positions = [];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if ((row !== excludeRow || col !== excludeCol) && 
                    board.cells[row][col].value === 0 && 
                    this.isValidPlacement(board, row, col, value)) {
                    positions.push({ row, col });
                }
            }
        }
        
        return positions;
    }

    // 检查在指定位置放置数字是否合法
    isValidPlacement(board, row, col, value) {
        // 检查行
        for (let c = 0; c < 9; c++) {
            if (c !== col && board.cells[row][c].value === value) {
                return false;
            }
        }
        
        // 检查列
        for (let r = 0; r < 9; r++) {
            if (r !== row && board.cells[r][col].value === value) {
                return false;
            }
        }
        
        // 检查宫
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && board.cells[r][c].value === value) {
                    return false;
                }
            }
        }
        
        return true;
    }
} 