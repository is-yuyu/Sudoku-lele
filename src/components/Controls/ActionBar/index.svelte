<script>
  export let hintDetail = null;
  export let highlightHint = false;
  let showReasoning = false;
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function toggleReasoning() {
    showReasoning = !showReasoning;
  }
  function locate(e) {
    e.stopPropagation();
    dispatch('locate');
  }
</script>

{#if hintDetail}
  <div class="hint-bar" on:click={toggleReasoning} style="cursor:pointer;">
    <div style="display:flex;align-items:center;width:100%;">
      <div class="strategy-chain" style="flex:1;">
        {#if hintDetail.strategyChain}
          {hintDetail.strategyChain.join(' → ')}
        {:else if hintDetail.type}
          {hintDetail.type}
        {/if}
      </div>
      <button class="locate-btn" on:click={locate}>
        {highlightHint ? '已定位' : '定位'}
      </button>
    </div>
    <div class="desc">{hintDetail.description}</div>
    {#if showReasoning && hintDetail.reasoning}
      <div class="reasoning">
        {#each hintDetail.reasoning.split('\n') as line}
          <div>{line}</div>
        {/each}
      </div>
    {/if}
    <div class="expand-tip">{showReasoning ? '点击收起详细推理' : '点击展开详细推理'}</div>
  </div>
{/if}

<div class="actionbar-row">
  <slot />
</div>

<style>
.hint-bar {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #0001;
  padding: 8px 16px;
  margin: 8px 0 12px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: box-shadow 0.2s;
}
.hint-bar:hover {
  box-shadow: 0 4px 16px #0002;
}
.strategy-chain {
  color: #2563eb;
  font-weight: bold;
  margin-bottom: 2px;
  font-size: 1.1rem;
}
.desc {
  color: #374151;
  font-size: 0.95rem;
  margin-bottom: 2px;
}
.reasoning {
  margin-top: 8px;
  color: #334155;
  font-size: 0.95rem;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 8px 12px;
  width: 100%;
  box-sizing: border-box;
}
.expand-tip {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 4px;
}
.actionbar-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}
.locate-btn {
  margin-left: 12px;
  padding: 4px 14px;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  border: none;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}
.locate-btn:hover {
  background: #1d4ed8;
}
.locate-btn:active {
  background: #1e40af;
}
</style>