<script lang="ts">
  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';

  export let title = 'Title';

  let visible = false;

  function onKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      toggle(false);
    }
  }

  function toggle(active: boolean) {
    visible = active;

    if (active) {
      window.addEventListener('keydown', onKeyDown);
    } else {
      window.removeEventListener('keydown', onKeyDown);
    }
  }

  export function close() {
    toggle(false);
  }

  export function open() {
    toggle(true);
  }

  onDestroy(() => {
    window.removeEventListener('keydown', onKeyDown);
  });
</script>

{#if visible}
  <div class="modal is-active">
    <div class="modal-background"
        on:click="{() => toggle(false)}"></div>
    <div class="modal-card"
        in:fly="{{ duration: 500, y: -250 }}"
        out:fly="{{ duration: 250, y: -250 }}">
      <header class="modal-card-head">
        <p class="modal-card-title">{title}</p>
        <button class="delete"
            aria-label="close"
            on:click="{() => toggle(false)}" />
      </header>
      <section class="modal-card-body">
        <slot name="content" />
      </section>
      <footer class="modal-card-foot is-justify-content-center">
        <slot name="footer" />
      </footer>
    </div>
  </div>
{/if}

<style lang="scss">
  @media screen and (min-width: 769px) {
    .modal-card {
      width: 50%;
    }
  }
</style>
