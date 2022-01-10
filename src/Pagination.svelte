<script lang="ts">
  import {
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faAngleLeft,
    faAngleRight,
  } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import FaIcon from 'svelte-fa';

  export let perPage = 1;
  export let total = 1;

  const dispatch = createEventDispatcher();
  let currentPage = 1;

  $: pages = Math.ceil(total / perPage);

  function goToPage(page: number) {
    if (currentPage === page) {
      return;
    }

    currentPage = page;
    dispatch('paginate', (currentPage - 1));
  }

  // eslint-disable-next-line no-sequences, @typescript-eslint/no-unused-expressions
  $: total, goToPage(1);
</script>
<nav class="pagination is-centered">
  <button class="button pagination-previous"
      disabled={(currentPage === 1)}
      on:click={() => goToPage(1)}>
    <FaIcon icon={faAngleDoubleLeft} />
  </button>
  <button class="button pagination-previous"
      disabled={(currentPage === 1)}
      on:click={() => goToPage(currentPage - 1)}>
    <FaIcon icon={faAngleLeft} />
  </button>
  <button class="button pagination-next"
      disabled={(currentPage >= pages)}
      on:click={() => goToPage(currentPage + 1)}>
    <FaIcon icon={faAngleRight} />
  </button>
  <button class="button pagination-next"
      disabled={(currentPage >= pages)}
      on:click={() => goToPage(pages)}>
    <FaIcon icon={faAngleDoubleRight} />
  </button>
  <ul class="pagination-list">
    {#if currentPage > 2}
      <li>
        <button class="button pagination-link"
            on:click={() => goToPage(1)}>
          1
        </button>
      </li>
    {/if}
    {#if currentPage > 3}
      <li>
        <span class="pagination-ellipsis">
          &hellip;
        </span>
      </li>
    {/if}
    {#if currentPage > 1}
      <li>
        <button class="button pagination-link"
            on:click={() => goToPage(currentPage - 1)}>
          {currentPage - 1}
        </button>
      </li>
    {/if}
      <li>
        <button class="button pagination-link is-current">
          {currentPage}
        </button>
      </li>
    {#if currentPage < (pages - 1)}
      <li>
        <button class="button pagination-link"
            on:click={() => goToPage(currentPage + 1)}>
          {currentPage + 1}
        </button>
      </li>
    {/if}
    {#if currentPage < (pages - 2)}
      <li>
        <span class="pagination-ellipsis">
          &hellip;
        </span>
      </li>
    {/if}
    {#if currentPage < pages}
      <li>
        <button class="button pagination-link"
            on:click={() => goToPage(pages)}>
          {pages}
        </button>
      </li>
    {/if}
  </ul>
</nav>
