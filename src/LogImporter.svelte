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

    if (lines[0].trim().startsWith('Name')) {
      lines.shift();
    }

    const rows = lines.map((log) => {
      const parts = log.trim().split('\t');
      const nameParts = parts[0].split(' ');
      const digits = parts[1].match(/(\d+)/g);
      const negative = parts[1].startsWith('-');
      const fulldate = new Date(parts[3].replace(/st|nd|rd|th/, ''));

      return {
        date: fulldate.toISOString().split('T')[0],
        employee: nameParts.slice(-2).join(' '),
        fulldate,
        item: parts[2],
        quantity: parseInt(negative ? (-digits[0]).toString() : digits[0], 10),
        rank: nameParts.slice(0, -2).join(' '),
        value: parseInt(negative ? (-digits[1]).toString() : digits[1], 10),
      };
    });

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
    title="Import fund logs">
  <textarea class="textarea"
    rows="25"
    placeholder="Raw log"
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
