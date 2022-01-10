<script lang="ts">
  import { faBox, faCalendar, faIdCard } from '@fortawesome/free-solid-svg-icons';
  import LogFilter from './LogFilter.svelte';
  import LogViewer from './LogViewer.svelte';
  import Octocat from './Octocat.svelte';
  import { datetime } from './actions';
</script>

<main>
  <Octocat />
  <section class="columns">
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
</main>

<style lang="scss" global>
	@import './styles/main';

  .columns, .column {
    height: 100vh;
  }

  .half {
    height: 50% !important;
  }
</style>
