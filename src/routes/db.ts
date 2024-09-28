import Dexie, { type EntityTable } from 'dexie';
import type { initial_data } from './data';

// SHAPE OF THE DATA
export interface Invoice {
	id?: number;
	date: string;
	form_data: typeof initial_data;
}

// DATABASE NAME
const db = new Dexie('InvoiceLocal') as Dexie & {
	invoices: EntityTable<Invoice, 'id'>;
};

db.version(1).stores({
	invoices: '++id, date'
});

export { db };
