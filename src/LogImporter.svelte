<script lang="ts">
  import { faUpload } from '@fortawesome/free-solid-svg-icons';
  import FaIcon from 'svelte-fa';
  import Modal from './Modal.svelte';
  import { logs } from './storage';

  let modal: Modal;
  let raw = '';

  function clear() {
    raw = '';
  }

  function importLogs() {
    const lines = raw.split('\n');
    const rows = lines.reduce((all, line) => {
      if (line.length === 0 || line.trim().startsWith('Name')) {
        return all;
      }

      const parts = line.match(/(.*)\t(\+|-)\s*(\d+)(?:\s*\(£(\d+)\))?\t(.*)\t(.*)/);
      const nameParts = parts[1].split(' ');
      const fulldate = new Date(parts[parts.length - 1].replace(/st|nd|rd|th/, ''));
      const negative = parts[2] === '-';

      let quantity = parseInt(`${(negative ? '-' : '')}${parts[3]}`, 10);
      let value = 0;

      if (line.includes('£')) {
        value = parseInt(`${(negative ? '-' : '')}${parts[4]}`, 10);
      } else if (line.includes('Insurance') || line.includes('Purchase')) {
        quantity = -1;
        value = -parts[3];
      } else {
        value = 0;
      }

      return all.concat({
        date: fulldate.toISOString().split('T')[0],
        employee: nameParts.slice(-2).join(' '),
        fulldate,
        item: parts[parts.length - 2],
        quantity,
        rank: nameParts.slice(0, -2).join(' '),
        value,
      });
    }, []);

    logs.update(($logs) => $logs.concat(rows));
    clear();
    modal.close();
  }
</script>

<button class="button is-primary"
    on:click="{() => modal.open()}">
  <span class="icon is-small">
    <FaIcon icon={faUpload} />
  </span>
  <span>Import</span>
</button>

<Modal bind:this="{modal}"
    title="Import logs">

  <textarea class="textarea"
      rows="25"
      placeholder="Copy the highlighted rows from your log here..."
      slot="content"
      bind:value={raw} />
  <div slot="footer">
    <button class="button is-primary is-outlined"
        disabled={!raw}
        on:click={importLogs}>
      <span class="icon is-small">
        <FaIcon icon={faUpload} />
      </span>
      <span>Import</span>
    </button>
    <button class="button is-secondary"
        on:click={clear}>
      Clear
    </button>
  </div>
</Modal>

<style lang="scss">
  @import './styles/_variables';

  textarea::placeholder {
    color: $text !important;
  }
</style>
