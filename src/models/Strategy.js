// 数独解题策略基类
export class Strategy {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    // 分析棋盘，返回提示信息
    analyze(board) {
        throw new Error('analyze method must be implemented');
    }

    // 计算指定位置的候选数
    calculateCandidates(board, row, col) {
        const candidates = [];
        
        // 如果格子已经有值，返回空数组
        if (board.cells[row][col].value !== 0) {
            return candidates;
        }
        
        // 检查每个数字1-9是否可以在该位置
        for (let n = 1; n <= 9; n++) {
            if (this.isValidPlacement(board, row, col, n)) {
                candidates.push(n);
            }
        }
        
        return candidates;
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

// Naked Single策略：某个格子只有一个候选数
export class NakedSingleStrategy extends Strategy {
    constructor() {
        super('Naked Single', '某个格子只有一个候选数');
    }

    analyze(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board.cells[row][col].value === 0) {
                    const candidates = this.calculateCandidates(board, row, col);
                    if (candidates.length === 1) {
                        // 额外验证：确保这个候选数真的可以放在这个位置
                        const value = candidates[0];
                        if (this.isValidPlacement(board, row, col, value)) {
                            return {
                                type: 'Naked Single',
                                cell: { row, col },
                                value: value,
                                description: `位置 (${row + 1}, ${col + 1}) 的候选数只有 ${value}，其他数字都已被排除`,
                                reasoning: this.generateReasoning(board, row, col, value)
                            };
                        }
                    }
                }
            }
        }
        return null;
    }

    // 生成推理过程说明
    generateReasoning(board, row, col, value) {
        const excludedNumbers = [];
        
        // 检查哪些数字被排除了
        for (let n = 1; n <= 9; n++) {
            if (n !== value && !this.isValidPlacement(board, row, col, n)) {
                excludedNumbers.push(n);
            }
        }
        
        let reasoning = `推理过程：\n`;
        reasoning += `1. 检查位置 (${row + 1}, ${col + 1}) 的所有可能数字\n`;
        
        if (excludedNumbers.length > 0) {
            reasoning += `2. 数字 ${excludedNumbers.join('、')} 因为以下原因被排除：\n`;
            
            // 分析每个被排除的数字
            for (const num of excludedNumbers) {
                const conflicts = this.findConflicts(board, row, col, num);
                reasoning += `   - 数字 ${num}：${conflicts}\n`;
            }
        }
        
        reasoning += `3. 因此，位置 (${row + 1}, ${col + 1}) 只能填入数字 ${value}`;
        
        return reasoning;
    }

    // 找出冲突的具体位置
    findConflicts(board, row, col, value) {
        const conflicts = [];
        
        // 检查行冲突
        for (let c = 0; c < 9; c++) {
            if (c !== col && board.cells[row][c].value === value) {
                conflicts.push(`第${row + 1}行第${c + 1}列已有${value}`);
            }
        }
        
        // 检查列冲突
        for (let r = 0; r < 9; r++) {
            if (r !== row && board.cells[r][col].value === value) {
                conflicts.push(`第${r + 1}行第${col + 1}列已有${value}`);
            }
        }
        
        // 检查宫冲突
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && board.cells[r][c].value === value) {
                    conflicts.push(`第${r + 1}行第${c + 1}列已有${value}`);
                }
            }
        }
        
        return conflicts.join('，');
    }
}

// Hidden Single策略：某行/列/宫中某个数字只能放在一个位置
export class HiddenSingleStrategy extends Strategy {
    constructor() {
        super('Hidden Single', '某行/列/宫中某个数字只能放在一个位置');
    }

    analyze(board) {
        // 检查行
        for (let row = 0; row < 9; row++) {
            const result = this.checkUnit(board, row, 'row');
            if (result) return result;
        }
        
        // 检查列
        for (let col = 0; col < 9; col++) {
            const result = this.checkUnit(board, col, 'col');
            if (result) return result;
        }
        
        // 检查宫
        for (let box = 0; box < 9; box++) {
            const result = this.checkUnit(board, box, 'box');
            if (result) return result;
        }
        
        return null;
    }

    checkUnit(board, unitIndex, unitType) {
        for (let value = 1; value <= 9; value++) {
            const positions = [];
            
            if (unitType === 'row') {
                // 检查行
                for (let col = 0; col < 9; col++) {
                    if (board.cells[unitIndex][col].value === 0 && 
                        this.isValidPlacement(board, unitIndex, col, value)) {
                        positions.push({ row: unitIndex, col });
                    }
                }
            } else if (unitType === 'col') {
                // 检查列
                for (let row = 0; row < 9; row++) {
                    if (board.cells[row][unitIndex].value === 0 && 
                        this.isValidPlacement(board, row, unitIndex, value)) {
                        positions.push({ row, col: unitIndex });
                    }
                }
            } else if (unitType === 'box') {
                // 检查宫
                const boxRow = Math.floor(unitIndex / 3) * 3;
                const boxCol = (unitIndex % 3) * 3;
                for (let r = boxRow; r < boxRow + 3; r++) {
                    for (let c = boxCol; c < boxCol + 3; c++) {
                        if (board.cells[r][c].value === 0 && 
                            this.isValidPlacement(board, r, c, value)) {
                            positions.push({ row: r, col: c });
                        }
                    }
                }
            }
            
            if (positions.length === 1) {
                const { row, col } = positions[0];
                
                // 额外验证：确保该数字真的只能放在这个位置
                const otherPositions = this.findOtherPositionsForValue(board, row, col, value);
                if (otherPositions.length === 0) {
                    return {
                        type: 'Hidden Single',
                        cell: { row, col },
                        value: value,
                        description: `在${unitType === 'row' ? '第' + (unitIndex + 1) + '行' : 
                                      unitType === 'col' ? '第' + (unitIndex + 1) + '列' : 
                                      '第' + (unitIndex + 1) + '宫'}中，数字 ${value} 只能放在位置 (${row + 1}, ${col + 1})`,
                        reasoning: this.generateHiddenSingleReasoning(board, unitIndex, unitType, value, row, col)
                    };
                }
            }
        }
        
        return null;
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

    // 生成Hidden Single的推理过程
    generateHiddenSingleReasoning(board, unitIndex, unitType, value, targetRow, targetCol) {
        let reasoning = `推理过程：\n`;
        reasoning += `1. 检查${unitType === 'row' ? '第' + (unitIndex + 1) + '行' : 
                           unitType === 'col' ? '第' + (unitIndex + 1) + '列' : 
                           '第' + (unitIndex + 1) + '宫'}中数字 ${value} 的所有可能位置\n`;
        
        const excludedPositions = [];
        
        if (unitType === 'row') {
            for (let col = 0; col < 9; col++) {
                if (col !== targetCol && board.cells[unitIndex][col].value === 0) {
                    if (!this.isValidPlacement(board, unitIndex, col, value)) {
                        excludedPositions.push(`第${unitIndex + 1}行第${col + 1}列`);
                    }
                }
            }
        } else if (unitType === 'col') {
            for (let row = 0; row < 9; row++) {
                if (row !== targetRow && board.cells[row][unitIndex].value === 0) {
                    if (!this.isValidPlacement(board, row, unitIndex, value)) {
                        excludedPositions.push(`第${row + 1}行第${unitIndex + 1}列`);
                    }
                }
            }
        } else if (unitType === 'box') {
            const boxRow = Math.floor(unitIndex / 3) * 3;
            const boxCol = (unitIndex % 3) * 3;
            for (let r = boxRow; r < boxRow + 3; r++) {
                for (let c = boxCol; c < boxCol + 3; c++) {
                    if ((r !== targetRow || c !== targetCol) && board.cells[r][c].value === 0) {
                        if (!this.isValidPlacement(board, r, c, value)) {
                            excludedPositions.push(`第${r + 1}行第${c + 1}列`);
                        }
                    }
                }
            }
        }
        
        if (excludedPositions.length > 0) {
            reasoning += `2. 以下位置不能放置数字 ${value}：${excludedPositions.join('、')}\n`;
        }
        
        reasoning += `3. 因此，数字 ${value} 只能放在位置 (${targetRow + 1}, ${targetCol + 1})`;
        
        return reasoning;
    }
} 

// Pointing Pairs策略：某个宫中的某个数字只能放在一行或一列中
export class PointingPairsStrategy extends Strategy {
    constructor() {
        super('Pointing Pairs', '某个宫中的某个数字只能放在一行或一列中，可以排除该行/列其他宫中的该数字');
    }

    analyze(board) {
        for (let box = 0; box < 9; box++) {
            const boxRow = Math.floor(box / 3) * 3;
            const boxCol = (box % 3) * 3;
            
            for (let value = 1; value <= 9; value++) {
                const positions = [];
                
                // 找出该宫中该数字的所有可能位置
                for (let r = boxRow; r < boxRow + 3; r++) {
                    for (let c = boxCol; c < boxCol + 3; c++) {
                        if (board.cells[r][c].value === 0 && 
                            this.isValidPlacement(board, r, c, value)) {
                            positions.push({ row: r, col: c });
                        }
                    }
                }
                
                if (positions.length >= 2) {
                    // 检查是否都在同一行
                    const rows = [...new Set(positions.map(p => p.row))];
                    if (rows.length === 1) {
                        const row = rows[0];
                        const eliminate = this.findEliminatePositions(board, row, 'row', boxCol, value);
                        if (eliminate.length > 0) {
                            // 验证：确保主要格子真的可以放这个数字
                            const mainCell = positions[0];
                            if (this.isValidPlacement(board, mainCell.row, mainCell.col, value)) {
                                return {
                                    type: 'Pointing Pairs',
                                    cell: mainCell,
                                    value: value,
                                    eliminate: eliminate,
                                    description: `第${box + 1}宫中的数字 ${value} 只能放在第${row + 1}行，可以排除该行其他宫中的数字 ${value}`,
                                    reasoning: this.generatePointingPairsReasoning(board, box, value, row, 'row', eliminate)
                                };
                            }
                        }
                    }
                    
                    // 检查是否都在同一列
                    const cols = [...new Set(positions.map(p => p.col))];
                    if (cols.length === 1) {
                        const col = cols[0];
                        const eliminate = this.findEliminatePositions(board, col, 'col', boxRow, value);
                        if (eliminate.length > 0) {
                            // 验证：确保主要格子真的可以放这个数字
                            const mainCell = positions[0];
                            if (this.isValidPlacement(board, mainCell.row, mainCell.col, value)) {
                                return {
                                    type: 'Pointing Pairs',
                                    cell: mainCell,
                                    value: value,
                                    eliminate: eliminate,
                                    description: `第${box + 1}宫中的数字 ${value} 只能放在第${col + 1}列，可以排除该列其他宫中的数字 ${value}`,
                                    reasoning: this.generatePointingPairsReasoning(board, box, value, col, 'col', eliminate)
                                };
                            }
                        }
                    }
                }
            }
        }
        
        return null;
    }

    // 找出可以排除的位置
    findEliminatePositions(board, lineIndex, lineType, boxStart, value) {
        const eliminate = [];
        
        if (lineType === 'row') {
            // 排除该行其他宫中的该数字
            for (let col = 0; col < 9; col++) {
                const colBox = Math.floor(col / 3);
                const boxCol = Math.floor(boxStart / 3);
                
                if (colBox !== boxCol && 
                    board.cells[lineIndex][col].value === 0 && 
                    this.isValidPlacement(board, lineIndex, col, value)) {
                    eliminate.push({ row: lineIndex, col });
                }
            }
        } else if (lineType === 'col') {
            // 排除该列其他宫中的该数字
            for (let row = 0; row < 9; row++) {
                const rowBox = Math.floor(row / 3);
                const boxRow = Math.floor(boxStart / 3);
                
                if (rowBox !== boxRow && 
                    board.cells[row][lineIndex].value === 0 && 
                    this.isValidPlacement(board, row, lineIndex, value)) {
                    eliminate.push({ row, col: lineIndex });
                }
            }
        }
        
        return eliminate;
    }

    // 生成Pointing Pairs的推理过程
    generatePointingPairsReasoning(board, box, value, lineIndex, lineType, eliminate) {
        const boxRow = Math.floor(box / 3) * 3;
        const boxCol = (box % 3) * 3;
        
        let reasoning = `推理过程：\n`;
        reasoning += `1. 检查第${box + 1}宫（位置${boxRow + 1}-${boxRow + 3}行，${boxCol + 1}-${boxCol + 3}列）中数字 ${value} 的所有可能位置\n`;
        
        const positions = [];
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (board.cells[r][c].value === 0 && 
                    this.isValidPlacement(board, r, c, value)) {
                    positions.push(`(${r + 1}, ${c + 1})`);
                }
            }
        }
        
        reasoning += `2. 数字 ${value} 在该宫中的可能位置：${positions.join('、')}\n`;
        reasoning += `3. 这些位置都在第${lineIndex + 1}${lineType === 'row' ? '行' : '列'}中\n`;
        reasoning += `4. 根据数独规则，如果某个宫中的数字只能放在一行或一列中，那么该行/列的其他宫中就不能再放置该数字\n`;
        
        if (eliminate.length > 0) {
            const eliminatePositions = eliminate.map(p => `(${p.row + 1}, ${p.col + 1})`);
            reasoning += `5. 因此可以排除第${lineIndex + 1}${lineType === 'row' ? '行' : '列'}其他宫中的数字 ${value}：${eliminatePositions.join('、')}\n`;
        }
        
        reasoning += `6. 数字 ${value} 只能放在位置 (${boxRow + 1}, ${boxCol + 1})`;
        
        return reasoning;
    }
} 