<script lang="ts">
  import {
    faBox,
    faCalendar,
    faExclamationTriangle,
    faIdCard,
  } from '@fortawesome/free-solid-svg-icons';
  import { fly } from 'svelte/transition';
  import FaIcon from 'svelte-fa';
  import Help from './Help.svelte';
  import LogFilter from './LogFilter.svelte';
  import LogImporter from './LogImporter.svelte';
  import LogViewer from './LogViewer.svelte';
  import Octocat from './Octocat.svelte';
  import { datetime } from './actions';
  import { logs, LogType, logType } from './storage';
</script>

<main>
  <Octocat />
  {#if !$logs.length}
    <section class="hero is-fullheight is-hidden-touch">
      <div class="hero-body is-flex-direction-column is-justify-content-center">
        <div class="box p-5"
            in:fly="{{ duration: 500, y: -500 }}"
            out:fly="{{ duration: 250, y: -500 }}">
          <div class="background" />
          <div class="body">
            <p class="title">
              RPUK Loganalyser
            </p>
            <div class="block is-flex is-justify-content-center">
              <LogImporter />
              <Help />
            </div>
            <ul class="panel">
              <li class="panel-heading">
                Supported Logs
              </li>
              <li class="panel-block content">
                <ul class="mt-0">
                  <li>Armoury</li>
                  <li>Evidence</li>
                  <li>Fund</li>
                  <li>Vehicle</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  {:else}
    <section class="columns is-hidden-touch m-0">
      <div class="column">
        <LogFilter filter={'date'}
            showChanges={$logType === LogType.Vehicle}
            showValueTotal={true}
            icon={faCalendar}
            sortAsc={false}
            title="Dates">
          <span slot="name"
              use:datetime={[new Date(option), { dateStyle: 'full' }]}
              let:option />
        </LogFilter>
      </div>
      <div class="column is-half is-flex is-flex-direction-column">
        <LogViewer />
      </div>
      <div class="column is-flex is-flex-direction-column">
        <div class="half pb-1">
          <LogFilter filter={'employee'}
              showChanges={$logType === LogType.Vehicle}
              icon={faIdCard}
              title="Employees" />
        </div>
        <div class="half pt-1">
          <LogFilter filter={($logType === LogType.Vehicle ? 'vehicle' : 'item')}
              showChanges={true}
              icon={faBox}
              title={($logType === LogType.Vehicle ? 'Vehicles' : 'Items')} />
        </div>
      </div>
    </section>
  {/if}
  <section class="columns is-hidden-desktop">
    <div class="column is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
      <span class="icon is-large has-text-warning">
        <FaIcon icon={faExclamationTriangle}
            size="3x" />
      </span>
      <h4 class="is-size-4 has-text-centered">
        Going to need a larger screen for this one, bossman!
      </h4>
    </div>
  </section>
</main>

<style lang="scss" global>
	@import './styles/main';

  .box {
    position: relative;

    .background {
      background: url('../img/RPUK.png') center center no-repeat;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      height: 80%;
      width: 80%;
      filter: blur(20px) brightness(.5);
    }

    .body {
      position: relative;
    }
  }

  .block > :last-child {
    margin-left: 0.75rem;
  }

  .columns, .column {
    height: 100vh;
    margin-bottom: 0 !important;
  }

  .half {
    height: 50% !important;
  }
</style>
