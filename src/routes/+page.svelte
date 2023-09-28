<script lang="ts">
  import '../styles/main.scss';
  import {
    faBox,
    faCalendar,
    faCar,
    faExclamationTriangle,
    faIdCard,
    faUserMd,
    type IconDefinition,
  } from '@fortawesome/free-solid-svg-icons';
  import FaIcon from 'svelte-fa';
  import { datetime } from '$lib/actions';
  import { logManager } from '$lib/storage';
  import Help from './Help.svelte';
  import LogFilter from './LogFilter.svelte';
  import LogImporter from './LogImporter.svelte';
  import LogViewer from './LogViewer.svelte';
  import Octocat from './Octocat.svelte';
  import { LogType, type Filter } from '$lib/logs';

  let dynamicFilter: {
    filter: Filter;
    icon: IconDefinition;
    title: string;
  } = {
    filter: 'item',
    icon: faBox,
    title: 'Item',
  };

  $: showChanges = $logManager?.type === LogType.Prison || $logManager?.type === LogType.Vehicle;
  $: if ($logManager?.type === LogType.Prison) {
    dynamicFilter = {
      filter: 'jobAction',
      icon: faUserMd,
      title: '[Job] Action',
    };
  } else if ($logManager?.type === LogType.Vehicle) {
    dynamicFilter = {
      filter: 'vehicle',
      icon: faCar,
      title: 'Vehicle',
    };
  }
</script>

<Octocat />
{#if !$logManager}
  <section class="hero is-fullheight is-hidden-touch">
    <div class="hero-body is-flex-direction-column is-justify-content-center">
      <div class="box p-5">
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
                <li>Prison</li>
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
          showChanges={showChanges}
          showValueTotal={true}
          icon={faCalendar}
          sortAsc={false}
          title="Dates">
        <span slot="name"
            let:option
            use:datetime={[new Date(option), { dateStyle: 'full' }]} />
      </LogFilter>
    </div>
    <div class="column is-half is-flex is-flex-direction-column">
      <LogViewer />
    </div>
    <div class="column is-flex is-flex-direction-column">
      <div class="half pb-1">
        <LogFilter filter={'employee'}
            showChanges={showChanges}
            icon={faIdCard}
            title="Employees" />
      </div>
      <div class="half pt-1">
        <LogFilter filter={dynamicFilter.filter}
            showChanges={true}
            icon={dynamicFilter.icon}
            title={dynamicFilter.title} />
      </div>
    </div>
  </section>
{/if}
<section class="columns is-hidden-desktop is-centered is-flex is-align-items-center">
  <div class="column has-text-centered">
    <span class="icon is-large has-text-warning">
      <FaIcon icon={faExclamationTriangle}
          size="3x" />
    </span>
    <h4 class="is-size-4">
      Going to need a larger screen for this one, bossman!
    </h4>
  </div>
</section>

<style lang="scss">
  .box {
    position: relative;
    animation: .5s ease-out 0s 1 slideInFromTop;

    .background {
      background: url('$lib/assets/RPUK.png') center center no-repeat;
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

  .block > :global(:last-child) {
    margin-left: 0.75rem;
  }

  .columns {
    height: 100vh;
  }

  .half {
    height: 50% !important;
  }

  @keyframes slideInFromTop {
    0% {
      transform: translateY(-200%);
    }
    100% {
      transform: translateY(0);
    }
  }
</style>
