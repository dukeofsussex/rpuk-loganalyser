<script lang="ts">
  import {
    faInfoCircle,
    faSort,
    faSortDown,
    faSortUp,
  } from '@fortawesome/free-solid-svg-icons';
  import FaIcon from 'svelte-fa';
  import LogImporter from './LogImporter.svelte';
  import Pagination from './Pagination.svelte';
  import { datetime, quid } from './actions';
  import { filteredLogs } from './storage';
  import { numberCompareFn, stringCompareFn } from './utils';

  interface SortingColumn {
    name: string;
    prop?: string;
    compareFn: (a: any, b: any, asc: boolean) => number;
  }

  const sortingColumns: SortingColumn[] = [{
    name: 'Rank',
    compareFn: stringCompareFn,
  }, {
    name: 'Employee',
    compareFn: stringCompareFn,
  }, {
    name: 'Quantity',
    compareFn: numberCompareFn,
  }, {
    name: 'Value',
    compareFn: numberCompareFn,
  }, {
    name: 'Item',
    compareFn: stringCompareFn,
  }, {
    name: 'Date',
    prop: 'fulldate',
    compareFn: numberCompareFn,
  }];

  let limit = 25;
  let offset = 0;
  let sortIndex = 5;
  let sortAsc = false;

  $: invalidLimit = !limit || (limit < 1);
  $: sortByProp = sortingColumns[sortIndex].prop || sortingColumns[sortIndex].name.toLowerCase();
  $: sortedLogs = $filteredLogs
    .sort((a, b) => sortingColumns[sortIndex].compareFn(a[sortByProp], b[sortByProp], sortAsc))
    .slice(offset, offset + limit);
  $: sortIcons = sortingColumns.map((_, index) => {
    let icon = faSort;

    if (index === sortIndex) {
      icon = sortAsc ? faSortUp : faSortDown;
    }

    return icon;
  }, {});

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
  <LogImporter />
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
          {#each sortingColumns as column, index}
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
          <tr>
            <td title={log.rank}>{log.rank.match(/(\b\w)/g).join('')}</td>
            <td>{log.employee}</td>
            <td>{(log.quantity > 0 ? '+' : '')}{log.quantity}</td>
            <td class:has-background-success={log.value > 0}
                class:has-background-danger={log.value < 0}
                use:quid={log.value} />
            <td>{log.item}</td>
            <td use:datetime={[log.fulldate, { dateStyle: 'medium', timeStyle: 'medium' }]} />
          </tr>
        {/each}
        {#if !sortedLogs.length}
          <tr>
            <td colspan="6"
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
  }
</style>
