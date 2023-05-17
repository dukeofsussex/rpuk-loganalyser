<script lang="ts">
  import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
  import FaIcon from 'svelte-fa';
  import Modal from './Modal.svelte';

  let modal: Modal;
</script>

<button class="button is-warning is-outlined"
    on:click="{() => modal.open()}">
  <span class="icon is-small">
    <FaIcon icon={faQuestionCircle} />
  </span>
</button>

<Modal bind:this="{modal}"
    title="Help">

  <section class="content"
      slot="content">
    <article class="message is-warning">
      <div class="message-body p-3">
        <h5 class="title is-5 has-text-warning-dark mb-2">
          Did you know?
        </h5>
        You can double-click any filter to select <b>ONLY</b> that filter!
      </div>
    </article>
    <dl>
      <dt class="title is-5 mb-2">
        What?
      </dt>
      <dd>
        Utility to analyse faction/group logs. No more, no less.
      </dd>
      <dt class="title is-5 mt-2 mb-2">
        Why?
      </dt>
      <dd>
        <ul class="ml-0">
          <li>
            Because the built-in filtering is insufficient
            (only able to filter by character or item, not both).
          </li>
          <li>Because I can.</li>
        </ul>
      </dd>
      <dt class="title is-5 mt-2 mb-2">
        Who?
      </dt>
      <dd>
        <a class="has-text-primary"
            href="https://www.roleplay.co.uk/profile/70814-duke-of-sussex/"
            target="_blank"
            rel="noopener noreferrer">
          Me
        </a>
      </dd>
      <dt class="title is-5 mt-2 mb-2">
        How?
      </dt>
      <dd>
        <ol class="is-upper-roman">
          <li>
            Highlight and copy all rows in the log you want to import
            (table headers can also be imported as they are ignored).
          </li>
          <li>Click on "Import" at the top of this page.</li>
          <li>Paste the copied logs.</li>
          <li>Click on "Import".</li>
          <li>Voilà!</li>
        </ol>
      </dd>
      <dt class="title is-5 mt-2 mb-2">
        Sauce?
      </dt>
      <dd>
        <a class="has-text-primary"
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer">
          Here you go
        </a>
        or click on the Octocat in the top right corner.
      </dd>
  </section>
  <div slot="footer">
    <button class="button is-secondary"
        on:click="{() => modal.close()}">
      Close
    </button>
  </div>
</Modal>
