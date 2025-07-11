<script>
import { branchPoints } from '../../stores/branchPoints.js';
import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import { createEventDispatcher } from 'svelte';
import { getCurrentBoardData } from '../../stores/branchPoints.js';
import BranchPoint from '../../models/BranchPoint.js';
const dispatch = createEventDispatcher();

export let show = false;
export let onClose = () => {};
export let onRestore = (id) => {};

let editingId = null;
let editingName = '';
let confirmDeleteId = null;
let confirmDeleteName = '';

let newBranchName = '';
let newBranchError = '';

let branchPointsList = [];
const unsubscribe = branchPoints.subscribe(list => {
  branchPointsList = list;
});

onMount(() => {
  return () => unsubscribe();
});

function startEdit(id, name) {
  editingId = id;
  editingName = name;
}
function saveEdit() {
  if (editingId && editingName.trim()) {
    const bp = branchPoints.restore(editingId);
    if (bp) {
      bp.name = editingName.trim();
      bp.save();
      branchPoints.refresh();
    }
  }
  editingId = null;
  editingName = '';
}
function cancelEdit() {
  editingId = null;
  editingName = '';
}
function askDelete(id, name) {
  confirmDeleteId = id;
  confirmDeleteName = name;
}
function doDelete() {
  branchPoints.remove(confirmDeleteId);
  confirmDeleteId = null;
  confirmDeleteName = '';
}
function cancelDelete() {
  confirmDeleteId = null;
  confirmDeleteName = '';
}

function addBranch() {
  if (branchPointsList.length >= 10) {
    newBranchError = '最多保存10个分支点，请先删除部分分支点';
    return;
  }
  const id = Date.now().toString();
  const name = newBranchName.trim() || `分支点 - ${new Date().toLocaleTimeString()}`;
  const timestamp = Date.now();
  const boardData = getCurrentBoardData();
  const steps = 0; // 可根据需要获取实际步数
  const bp = new BranchPoint(id, name, timestamp, boardData, steps);
  branchPoints.add(bp);
  newBranchName = '';
  newBranchError = '';
}
</script>

{#if show}
<div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
  <div class="bg-white p-6 rounded shadow-xl max-w-md w-full">
    <div class="flex justify-between items-center mb-4">
      <div class="text-xl font-bold">分支点管理</div>
      <button class="btn btn-small" on:click={() => { if (!confirmDeleteId) { console.log('close click'); dispatch('close'); }}} disabled={confirmDeleteId}>关闭</button>
    </div>
    <!-- 新建分支点输入框和按钮 -->
    <div class="flex mb-4 gap-2">
      <input class="input flex-1" placeholder="新分支点名称（可选）" bind:value={newBranchName} maxlength="20" />
      <button class="btn btn-primary" on:click={addBranch}>保存</button>
    </div>
    {#if newBranchError}
      <div class="text-red-500 mb-2">{newBranchError}</div>
    {/if}
    {#if branchPointsList.length === 0}
      <div class="text-gray-500 text-center py-8">暂无分支点</div>
    {:else}
      <div class="space-y-3 max-h-80 overflow-y-auto">
        {#each branchPointsList as bp}
          <div class="flex items-center border rounded px-3 py-2">
            {#if editingId === bp.id}
              <div class="flex items-center w-full gap-2">
                <input class="input w-1/2 mr-2" bind:value={editingName} maxlength="20" />
                <button class="btn btn-small btn-primary mr-1 whitespace-nowrap flex items-center justify-center" on:click={saveEdit}>保存</button>
                <button class="btn btn-small whitespace-nowrap flex items-center justify-center" on:click={cancelEdit}>取消</button>
              </div>
            {:else}
              <div class="flex-1">
                <div class="font-semibold">{bp.name}</div>
                <div class="text-xs text-gray-500">{new Date(bp.timestamp).toLocaleString()} | 步数: {bp.steps}</div>
              </div>
              <button class="btn btn-small mr-1" on:click={() => dispatch('restore', bp.id)}>恢复</button>
              <button class="btn btn-small mr-1" on:click={() => startEdit(bp.id, bp.name)}>重命名</button>
              <button class="btn btn-small btn-danger" on:click={() => askDelete(bp.id, bp.name)}>删除</button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
    {#if confirmDeleteId}
      <div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
        <div class="bg-white p-6 rounded shadow-xl max-w-xs w-full">
          <div class="mb-2">确认删除分支点 <span class="font-bold">{confirmDeleteName}</span>？</div>
          <button class="btn btn-danger w-full mb-2" on:click={doDelete}>确认删除</button>
          <button class="btn w-full" on:click={cancelDelete}>取消</button>
        </div>
      </div>
    {/if}
  </div>
</div>
{/if}

<style>
.btn-danger {
  background: #ef4444;
  color: #fff;
}
.btn-danger:hover {
  background: #dc2626;
}
</style> 