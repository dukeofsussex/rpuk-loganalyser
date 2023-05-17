<script lang="ts">
  import { faUpload } from '@fortawesome/free-solid-svg-icons';
  import FaIcon from 'svelte-fa';
  import {
    logs,
    LogType,
    logType,
    type FundLog,
    type Log,
    type VehicleLog,
  } from '$lib/storage';
  import Modal from './Modal.svelte';

  const CombinedRegex = /(.*)\t(\+|-)\s*(\d+)(?:\s*\(£(\d+)\))?\t(.*)\t(.*)/;
  const VehicleRegex = /(.*)\t(.*)\t(Retrieved|Stored)\t(.*)/;

  let error: string | null;
  let modal: Modal;
  let raw = '';

  function clear() {
    error = null;
    raw = '';
  }

  function importLogs() {
    const lines = raw.split('\n');
    const rows: (Log | FundLog | VehicleLog)[] = [];
    error = null;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];

      // Skip blank lines and table headers
      if (line.trim().length === 0 || line.trim().startsWith('Name')) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (!$logType) {
        if (line.includes('£')) {
          $logType = LogType.Fund;
        } else if (VehicleRegex.test(line)) {
          $logType = LogType.Vehicle;
        } else if (CombinedRegex.test(line)) {
          $logType = LogType.Default;
        } else {
          error = 'Unable to determine log type!';
          break;
        }
      }

      const parts = line.match($logType === LogType.Vehicle ? VehicleRegex : CombinedRegex);

      // Different log type
      if (!parts) {
        error = 'You cannot combine different types of logs!';
        break;
      }

      const fulldate = new Date(parts[parts.length - 1].replace(/st|nd|rd|th/, ''));
      const month = fulldate.getMonth() + 1;
      const dateData = {
        date: `${fulldate.getFullYear()}-${month < 10 ? '0' : ''}${month}-${fulldate.getDate() < 10 ? '0' : ''}${fulldate.getDate()}`,
        fulldate,
      };

      if ($logType === LogType.Vehicle) {
        (rows as VehicleLog[]).push({
          ...dateData,
          employee: parts[1],
          quantity: parts[3] === 'Retrieved' ? -1 : 1,
          vehicle: parts[2],
        });

        // eslint-disable-next-line no-continue
        continue;
      }

      const nameParts = parts[1].split(' ');
      const negative = parts[2] === '-';
      const quantity = line.includes('Insurance') || line.includes('Purchase')
        ? -1
        : parseInt(`${(negative ? '-' : '')}${parts[3]}`, 10);

      const row: Log = {
        ...dateData,
        employee: nameParts.slice(-2).join(' '),
        item: parts[parts.length - 2],
        quantity,
        rank: nameParts.slice(0, -2).join(' '),
      };

      if ($logType === LogType.Fund) {
        (rows as FundLog[]).push({
          ...row,
          value: line.includes('Insurance') || line.includes('Purchase')
            ? -parts[3]
            : parseInt(`${(negative ? '-' : '')}${parts[4]}`, 10),
        });
      } else {
        (rows as Log[]).push(row);
      }
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
