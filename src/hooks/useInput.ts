import { writable } from 'svelte/store';

/**
 * Hook sederhana untuk input form. `value` adalah store yang bisa di-bind
 * di komponen: `const { value: email } = useInput(''); <input bind:value={$email} />`
 */
export function useInput(initialValue = '') {
	const value = writable(initialValue);

	const onChange = (event: Event) => {
		value.set((event.target as HTMLInputElement).value);
	};

	const reset = () => value.set(initialValue);

	return { value, onChange, reset };
}
