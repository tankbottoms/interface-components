<script lang="ts">
	interface Props {
		code: string;
		language?: string;
	}

	let { code, language = 'html' }: Props = $props();
	let copied = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<div class="code-block">
	<div class="code-header">
		<span class="code-lang">{language}</span>
		<button class="copy-btn" onclick={copy}>
			<i class="fas {copied ? 'fa-check' : 'fa-copy'}"></i>
			{copied ? 'Copied' : 'Copy'}
		</button>
	</div>
	<pre><code>{code}</code></pre>
</div>

<style>
	.code-block {
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		font-size: 0.8rem;
		overflow-x: auto;
		margin-top: var(--spacing-md);
	}
	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-bottom: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
	}
	.code-lang {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}
	.copy-btn {
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		font-size: 0.65rem;
		padding: 0.15rem 0.4rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.copy-btn:hover {
		color: var(--color-text);
		border-color: var(--color-border-dark);
	}
	pre {
		padding: var(--spacing-sm) var(--spacing-md);
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}
	code {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		line-height: 1.5;
	}
</style>
