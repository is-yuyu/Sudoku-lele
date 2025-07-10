// Board（棋盘）模型
// 属性：cells（9x9 Cell 数组）、difficulty（难度）、status（未开始/进行中/完成）
// 方法：validate()、generateCandidates()、loadFromUrl()

import Cell from './Cell.js';

export default class Board {
    /**
     * @param {Cell[][]} cells 9x9的Cell对象数组
     * @param {string} difficulty 难度
     * @param {string} status 棋盘状态：未开始/进行中/完成
     */
    constructor(cells = null, difficulty = '未知', status = '未开始') {
        this.cells = cells || Board.createEmptyCells();
        this.difficulty = difficulty;
        this.status = status;
    }

    // 创建空棋盘
    static createEmptyCells() {
        const cells = [];
        for (let row = 0; row < 9; row++) {
            const rowCells = [];
            for (let col = 0; col < 9; col++) {
                rowCells.push(new Cell(row, col));
            }
            cells.push(rowCells);
        }
        return cells;
    }

    // 校验棋盘是否合法
    validate() {
        // 检查每行、每列、每宫是否有重复数字
        // 返回true表示合法，false表示不合法
        // 这里只做简单实现，详细可扩展
        const check = arr => {
            const nums = arr.filter(cell => cell.value !== 0).map(cell => cell.value);
            return new Set(nums).size === nums.length;
        };
        // 检查行
        for (let row = 0; row < 9; row++) {
            if (!check(this.cells[row])) return false;
        }
        // 检查列
        for (let col = 0; col < 9; col++) {
            const colArr = [];
            for (let row = 0; row < 9; row++) {
                colArr.push(this.cells[row][col]);
            }
            if (!check(colArr)) return false;
        }
        // 检查九宫格
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const box = [];
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        box.push(this.cells[boxRow * 3 + i][boxCol * 3 + j]);
                    }
                }
                if (!check(box)) return false;
            }
        }
        return true;
    }

    // 生成所有单元格的候选值
    generateCandidates() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.cells[row][col];
                if (cell.value === 0) {
                    cell.candidates = [];
                    for (let n = 1; n <= 9; n++) {
                        cell.value = n;
                        if (this.validate()) {
                            cell.candidates.push(n);
                        }
                        cell.value = 0;
                    }
                } else {
                    cell.candidates = [];
                }
            }
        }
    }

    // 从SudokuWiki URL加载题目（占位实现）
    async loadFromUrl(url) {
        // 这里可用fetch请求并解析HTML，提取棋盘数据
        // 占位：实际实现需根据SudokuWiki页面结构解析
        throw new Error('loadFromUrl方法待实现');
    }
} 