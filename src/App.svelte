<script lang="ts">
  import {
    faBox,
    faCalendar,
    faExclamationTriangle,
    faIdCard,
  } from '@fortawesome/free-solid-svg-icons';
  import FaIcon from 'svelte-fa';
  import LogFilter from './LogFilter.svelte';
  import LogViewer from './LogViewer.svelte';
  import Octocat from './Octocat.svelte';
  import { datetime } from './actions';
</script>

<main>
  <Octocat />
  <section class="columns is-hidden-touch">
    <div class="column">
      <LogFilter filter={'date'}
          icon={faCalendar}
          sortAsc={false}
          title="Dates">
        <span slot="name"
            use:datetime={[new Date(item), { dateStyle: 'long' }]}
            let:item />
      </LogFilter>
    </div>
    <div class="column is-half is-flex is-flex-direction-column">
      <LogViewer />
    </div>
    <div class="column is-flex is-flex-direction-column">
      <div class="half pb-1">
        <LogFilter filter={'employee'}
            icon={faIdCard}
            title="Employees" />
      </div>
      <div class="half pt-1">
        <LogFilter filter={'item'}
            icon={faBox}
            title="Items" />
      </div>
    </div>
  </section>
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

  .columns, .column {
    height: 100vh;
    margin-bottom: 0 !important;
  }

  .half {
    height: 50% !important;
  }
</style>
