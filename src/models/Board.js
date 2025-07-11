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

    // 从SudokuWiki URL加载题目
    async loadFromUrl(url) {
        try {
            // 1. 先尝试bd参数
            const bdMatch = url.match(/[?&]bd=([0-9.]{81})/i);
            if (bdMatch) {
                return this.loadFromBdString(bdMatch[1]);
            }

            // 2. 直接粘贴的81位字符串
            const str = url.replace(/[^0-9.]/g, '');
            if (str.length === 81) {
                return this.loadFromBdString(str);
            }

            // 3. fetch网页源码
            const res = await fetch(url);
            const html = await res.text();

            // 3.1 var puzzle = "..."
            const match = html.match(/var puzzle = "([0-9.]{81})"/);
            if (match) {
                return this.loadFromBdString(match[1]);
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
                    return this.loadFromArray(numbers);
                }
            }

            throw new Error('未找到有效棋盘数据');
        } catch (error) {
            throw new Error(`加载题目失败: ${error.message}`);
        }
    }

    // 从bd字符串加载题目
    loadFromBdString(bd) {
        const arr = bd.replace(/\./g, '0').split('').map(Number);
        return this.loadFromArray(arr);
    }

    // 从数组加载题目
    loadFromArray(arr) {
        if (arr.length !== 81) {
            throw new Error('棋盘数据长度不正确');
        }
        
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                this.cells[y][x].value = arr[y * 9 + x];
            }
        }
        
        return this;
    }
} 