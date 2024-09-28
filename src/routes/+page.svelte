<script lang="ts">
	import { initial_data } from './data';
	import { db, type Invoice } from './db';

	let form_data = $state(structuredClone(initial_data));
	let status: 'LOADING' | 'READY' = $state('LOADING');
	let loading_id: number | undefined | null = $state(null);
	let all_invoices: Invoice[] = $state([]);

	async function save(data: typeof initial_data) {
		if (loading_id) {
			await db.invoices.update(loading_id, {
				form_data: data,
				date: new Date().toISOString()
			});
		} else {
			const new_invoice_id = await db.invoices.add({
				date: new Date().toISOString(),
				form_data: data
			});
			loading_id = new_invoice_id;
		}
	}

	async function load_all_invoices() {
		all_invoices = await db.invoices.orderBy('date').toArray();
	}

	async function load_invoice(e: Event) {
		status = 'LOADING';
		const select = e?.target as HTMLSelectElement;
		const id = select.value ? parseInt(select.value) : null;

		if (id) {
			const selected_invoice = await db.invoices.get(id);
			if (selected_invoice) {
				form_data = selected_invoice.form_data;
				loading_id = selected_invoice.id;
			}
		}
		status = 'READY';
	}

	async function load_recent_invoice() {
		status = 'LOADING';

		const most_recent_invoice = await db.invoices.orderBy('date').last();
		if (most_recent_invoice) {
			form_data = most_recent_invoice.form_data;
			loading_id = most_recent_invoice.id;
		}

		status = 'READY';
	}

	function new_invoice() {
		loading_id = null;
		form_data = structuredClone(initial_data);
	}

	async function export_data() {
		try {
			const all_invoices_export = await db.invoices.toArray();
			const json_string = JSON.stringify(all_invoices_export, null, 2);
			const blob = new Blob([json_string], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = 'invoices.json';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error(error);
		}
	}

	$effect(() => {
		load_recent_invoice();
		load_all_invoices();
	});

	$effect(() => {
		if ((status = 'READY')) {
			save($state.snapshot(form_data));
		}
	});
</script>

<section>
	<h1>Invoice</h1>
	<div>
		<select value={loading_id} name="all_invoices" id="all_invoices" onchange={load_invoice}>
			{#each all_invoices as invoice}
				<option value={invoice.id}>{invoice.date}</option>
			{/each}
		</select>
		<button onclick={export_data}>Export</button>
		<button onclick={new_invoice}>New Invoice</button>
	</div>
	<div>
		<div>
			<label for="invoice">Invoice #</label>
			<input type="text" id="invoice" bind:value={form_data.invoice} />
		</div>
		<div>
			<label for="name">Name</label>
			<input type="text" id="name" bind:value={form_data.name} />
		</div>
	</div>
</section>
