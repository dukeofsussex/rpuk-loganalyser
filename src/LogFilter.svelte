<script lang="ts">
  import { faCheckSquare, faSearch, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
  import FaIcon from 'svelte-fa';
  import { quid } from './actions';
  import {
    balances,
    filters,
    quantities,
    type Filter,
  } from './storage';
  import { stringCompareFn } from './utils';

  export let filter: Filter;
  export let icon: IconDefinition;
  export let quantifiable = false;
  export let sortAsc = true;
  export let title = '';

  let query = '';

  $: filterKeys = [...$filters[filter].keys()];
  $: displayData = (query
    ? filterKeys.filter((x) => x.toLowerCase().indexOf(query.toLowerCase()) !== -1)
    : filterKeys).sort((a: string, b: string) => stringCompareFn(a, b, sortAsc));

  function toggle(option: string) {
    filters.update((f) => {
      f[filter].set(option, !f[filter].get(option));
      return f;
    });
  }

  function toggleAll(show: boolean) {
    filters.update((f) => {
      filterKeys.forEach((key) => {
        f[filter].set(key, show);
      });
      return f;
    });
  }

  function select(option: string) {
    filters.update((f) => {
      toggleAll(false);
      f[filter].set(option, true);
      return f;
    });
  }
</script>

<nav class="panel is-flex is-flex-direction-column">
  <p class="panel-heading">
    {title}
  </p>
  <div class="panel-block">
    <div class="field has-addons is-flex-grow-1">
      <p class="control has-icons-left is-expanded">
        <input class="input"
            type="text"
            placeholder="Filter"
            bind:value="{query}">
        <span class="icon is-left">
          <FaIcon icon={faSearch} />
        </span>
      </p>
      <p class="control">
        <button class="button"
            on:click={() => toggleAll(true)}>
          <span class="icon is-small">
            <FaIcon icon={faCheckSquare} />
          </span>
          <span>All</span>
        </button>
      </p>
    </div>
  </div>
  <div class="panel-group is-flex-shrink-1">
    {#each displayData as option}
      <!-- svelte-ignore a11y-missing-attribute -->
      <a class="panel-block is-justified-content-space-between is-unselectable"
          class:is-active="{$filters[filter].get(option) && $balances[filter].has(option)}"
          on:click={() => toggle(option)}
          on:dblclick={() => select(option)}>
        <span class="panel-icon">
          <FaIcon {icon} />
        </span>
        <span class="is-flex-grow-1">
          <slot name="name" {option}>
            {option}
          </slot>
        </span>
        <div class="tags has-addons">
          {#if quantifiable && $quantities.has(option)}
            <span class="tag">
              {($quantities.get(option) > 0 ? '+' : '')}{$quantities.get(option)}
            </span>
          {/if}
          {#if $balances[filter].has(option)}
            <span class="tag"
                class:is-danger={$balances[filter].get(option) < 0}
                class:is-success={$balances[filter].get(option) > 0}
                use:quid={$balances[filter].get(option)}/>
          {/if}
        </div>
      </a>
    {/each}
    {#if !displayData.length && query}
      <!-- svelte-ignore a11y-missing-attribute -->
      <a class="panel-block is-unselectable">
        Nothing found for "{query}"
      </a>
    {:else if !displayData.length}
      <!-- svelte-ignore a11y-missing-attribute -->
      <a class="panel-block is-unselectable is-text-centered">
        Nothing to display
      </a>
    {/if}
  </div>
</nav>

<style lang="scss">
  .panel {
    max-height: 100%;
  }

  .panel-group {
    overflow-y: auto;
  }
</style>
