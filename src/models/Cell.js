// Cell（单元格）模型
// 属性：row（行）、col（列）、value（值，0 表示空）、isFixed（是否固定）、isOriginal（是否为原始数字）、candidates（候选值列表）
// 方法：updateValue()、addCandidate()、removeCandidate()

export default class Cell {
    /**
     * @param {number} row 行号（0-8）
     * @param {number} col 列号（0-8）
     * @param {number} value 单元格值，0 表示空
     * @param {boolean} isFixed 是否为初始固定值
     * @param {boolean} isOriginal 是否为原始数字（题目中的数字）
     * @param {number[]} candidates 候选值数组
     */
    constructor(row, col, value = 0, isFixed = false, isOriginal = false, candidates = []) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.isFixed = isFixed;
        this.isOriginal = isOriginal;
        this.candidates = candidates;
    }

    // 更新单元格的值
    updateValue(newValue) {
        this.value = newValue;
    }

    // 添加候选值
    addCandidate(candidate) {
        if (!this.candidates.includes(candidate)) {
            this.candidates.push(candidate);
        }
    }

    // 移除候选值
    removeCandidate(candidate) {
        this.candidates = this.candidates.filter(c => c !== candidate);
    }
}