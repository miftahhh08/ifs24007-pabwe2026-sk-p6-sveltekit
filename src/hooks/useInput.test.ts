import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { useInput } from './useInput';

describe('useInput', () => {
	it('memakai string kosong sebagai nilai awal bawaan', () => {
		const { value } = useInput();
		expect(get(value)).toBe('');
	});

	it('mengubah nilai lewat onChange dan mengembalikannya lewat reset', () => {
		const { value, onChange, reset } = useInput('awal');
		expect(get(value)).toBe('awal');
		onChange({ target: { value: 'baru' } } as unknown as Event);
		expect(get(value)).toBe('baru');
		reset();
		expect(get(value)).toBe('awal');
	});
});
