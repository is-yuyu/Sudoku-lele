// BranchPoint（分支点）模型
// 属性：id、name、timestamp、boardData（棋盘快照）、steps（当前步数）
// 方法：save()、restore()、delete()

export default class BranchPoint {
    /**
     * @param {string} id 分支点唯一ID
     * @param {string} name 分支点名称
     * @param {number} timestamp 时间戳
     * @param {object} boardData 棋盘快照（可序列化）
     * @param {number} steps 当前步数
     */
    constructor(id, name, timestamp, boardData, steps) {
        this.id = id;
        this.name = name;
        this.timestamp = timestamp;
        this.boardData = boardData;
        this.steps = steps;
    }

    // 保存分支点到本地存储
    save() {
        const key = `branchpoint_${this.id}`;
        localStorage.setItem(key, JSON.stringify(this));
    }

    // 从本地存储恢复分支点
    static restore(id) {
        const key = `branchpoint_${id}`;
        const data = localStorage.getItem(key);
        if (data) {
            const obj = JSON.parse(data);
            return new BranchPoint(obj.id, obj.name, obj.timestamp, obj.boardData, obj.steps);
        }
        return null;
    }

    // 删除分支点
    delete() {
        const key = `branchpoint_${this.id}`;
        localStorage.removeItem(key);
    }
} 