<script lang="ts">
  import { faUpload } from '@fortawesome/free-solid-svg-icons';
  import FaIcon from 'svelte-fa';
  import {
    ArmouryLogManager,
    EvidenceLogManager,
    FundLogManager,
    PrisonLogManager,
    VehicleLogManager,
    type Log,
    type LogManager,
  } from '$lib/logs';
  import {
    logManager,
    logs,
  } from '$lib/storage';
  import Modal from './Modal.svelte';

  const logManagers = [
    new ArmouryLogManager(),
    new EvidenceLogManager(),
    new FundLogManager(),
    new PrisonLogManager(),
    new VehicleLogManager(),
  ];

  let error: string | null;
  let modal: Modal;
  let raw = '';

  function clear() {
    error = null;
    raw = '';
  }

  function importLogs() {
    const lines = raw.split('\n');
    const rows: Log[] = [];
    error = null;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim();

      // Skip blank lines and table headers
      if (line.length === 0 || line.startsWith('Name') || line.startsWith('Citizen')) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (!$logManager) {
        for (let j = 0; j < logManagers.length; j += 1) {
          const manager = logManagers[j];

          if (manager.isType(line)) {
            $logManager = manager as LogManager<Log>;
            break;
          }
        }

        if (!$logManager) {
          error = 'Unable to determine log type!';
          break;
        }
      }

      const log = $logManager.import(line);

      if (!log) {
        error = 'You cannot combine different types of logs!';
        break;
      }

      rows.push(log);
    }

    if (error) {
      return;
    }

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

  <div slot="content">
    {#if error}
      <article class="message is-danger">
        <div class="message-body p-3">
          {error}
        </div>
      </article>
    {/if}
    <textarea class="textarea"
      class:is-danger={error}
      rows="25"
      placeholder="Copy the highlighted rows from your log here..."
      bind:value={raw} />
  </div>
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
        disabled={!raw}
        on:click={clear}>
      Clear
    </button>
  </div>
</Modal>

<style lang="scss">
  @import '../styles/_variables';

  textarea::placeholder {
    color: $text !important;
  }
</style>
