<script lang="ts">
  import {
    faInfoCircle,
    faSort,
    faSortDown,
    faSortUp,
  } from '@fortawesome/free-solid-svg-icons';
  import FaIcon from 'svelte-fa';
  import { datetime, quid } from '$lib/actions';
  import { LogType, type Log, type LogCommon } from '$lib/logs';
  import { filteredLogs, logManager } from '$lib/storage';
  import Help from './Help.svelte';
  import LogImporter from './LogImporter.svelte';
  import Pagination from './Pagination.svelte';

  const grouping = {
    date: new Date(),
    employee: '',
    colourIndex: 0,
  };

  let limit = 25;
  let offset = 0;
  let sortIndex = $logManager.viewerColumns.length - 1;
  let sortAsc = false;

  $: invalidLimit = !limit || (limit < 1);
  $: sortByProp = ($logManager.viewerColumns[sortIndex].prop
    || $logManager.viewerColumns[sortIndex].name.toLowerCase()) as keyof Log;

  // Cast to any to stop Svelte complaining about types in template
  $: sortedLogs = $filteredLogs
    .sort((a, b) => $logManager.viewerColumns[sortIndex]
      .compareFn(a[sortByProp], b[sortByProp], sortAsc))

    // Typescript struggles with the different log types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .slice(offset, offset + limit) as any[];
  $: sortIcons = $logManager.viewerColumns.map((_, index) => {
    let icon = faSort;

    if (index === sortIndex) {
      icon = sortAsc ? faSortUp : faSortDown;
    }

    return icon;
  }, {});

  function group(log: LogCommon) {
    if (log.employee !== grouping.employee
        || Math.abs(log.fulldate.valueOf() - grouping.date.valueOf()) > 60000) {
      grouping.employee = log.employee;
      grouping.colourIndex = grouping.colourIndex === 0 ? 1 : 0;
    }

    grouping.date = log.fulldate;

    return `group-${grouping.colourIndex}`;
  }

  function onPaginate(event: CustomEvent<number>) {
    offset = event.detail * limit;
  }

  function sort(index: number) {
    if (sortIndex === index) {
      sortAsc = !sortAsc;
      return;
    }

    sortIndex = index;
    sortAsc = false;
  }
</script>

<div class="is-flex is-align-items-center is-justify-content-space-between">
  <button class="button is-static">
    Showing logs
    <b>{sortedLogs.length ? offset + 1 : 0}</b>
    -
    <b>{offset + sortedLogs.length}</b>
    of
    <b>{$filteredLogs.length}</b>
  </button>
  <span>
    <LogImporter />
    <Help />
  </span>
  <div class="field has-addons">
    <p class="control is-expanded">
      <button class="button is-static">
        Logs per page
      </button>
    </p>
    <div class="control">
      <input class="input"
          class:is-danger={invalidLimit}
          type="number"
          min="1"
          placeholder="#"
          bind:value={limit}>
      {#if invalidLimit}
        <p class="help is-danger">
          <FaIcon icon={faInfoCircle} />
          Don't be a doofus!
        </p>
      {/if}
    </div>
  </div>
</div>
<div class="table-container is-flex is-flex-grow-1 mt-5">
  <div class="full">
    <table class="table is-fullwidth is-hoverable">
      <thead>
        <tr>
          {#each $logManager.viewerColumns as column, index}
            <th class="is-clickable is-unselectable"
                on:click={() => sort(index)}>
              <span class="is-flex is-align-items-center">
                <span class="is-flex-grow-1">
                  {column.name}
                </span>
                <FaIcon icon={sortIcons[index]} />
              </span>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each sortedLogs as log}
          <tr class={group(log)}>
            {#each $logManager.viewerColumns as col}
              {#if col.prop === 'rank'}
                <td title={log.rank}>{log.rank.match(/(\b\w)/g)?.join('') ?? '-'}</td>
              {:else if col.prop === 'quantity'}
                <td class:has-background-success={log.quantity > 0 && !log.value}
                    class:has-background-danger={log.quantity < 0 && !log.value}>
                    {#if $logManager.type === LogType.Vehicle}
                      {(log.quantity === 1 ? 'Stored' : 'Retrieved')}
                    {:else}
                      {(log.quantity > 0 ? '+' : '')}{log.quantity}
                    {/if}
                </td>
              {:else if col.prop === 'value'}
                <td class:has-background-success={log.value > 0}
                    class:has-background-danger={log.value < 0}
                    use:quid={log.value} />
              {:else if col.prop === 'fulldate'}
                <td use:datetime={[log.fulldate, { dateStyle: 'medium', timeStyle: 'medium' }]} />
              {:else}
                <td>{log[col.prop]}</td>
              {/if}
            {/each}
          </tr>
        {/each}
        {#if !sortedLogs.length}
          <tr>
            <td colspan={$logManager.viewerColumns.length}
                class="has-text-centered">
              Nothing to display
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>
<Pagination perPage={limit}
    total={$filteredLogs.length}
    on:paginate={onPaginate} />

<style lang="scss">
  @import '../styles/_variables.scss';

  b {
    margin: 5px;
  }

  .table-container {
    overflow-y: auto;

    .full {
      height: 100%;
      width: 100%;
    }

    thead {
      position: sticky;
      top: 0;
      td, th {
        border-width: 0 0 1px;
      }
    }

    tr.group-0 {
      background-color: darken($table-background-color, 2.5%);
    }

    tr.group-1 {
      background-color: darken($table-background-color, 7.5%);
    }
  }
</style>
