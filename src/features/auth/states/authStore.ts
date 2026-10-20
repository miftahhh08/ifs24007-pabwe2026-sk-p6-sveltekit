import { writable } from 'svelte/store';
import { getErrorMessage, isSuccess, putAccessToken } from '../../../helpers/apiHelper';
import { resetUsersStore } from '../../users/states/usersStore';
import * as authApi from '../api/authApi';

export interface AuthState {
	isAuthLoading: boolean;
	isAuthLogin: boolean;
	isAuthRegister: boolean;
	isAuthLogout: boolean;
	message: string;
}

const createInitialState = (): AuthState => ({
	isAuthLoading: false,
	isAuthLogin: false,
	isAuthRegister: false,
	isAuthLogout: false,
	message: ''
});

export const authStore = writable<AuthState>(createInitialState());

export const resetAuthStore = () => authStore.set(createInitialState());

export async function login(email: string, password: string): Promise<boolean> {
	authStore.set({ ...createInitialState(), isAuthLoading: true });
	const response = await authApi.login(email, password);
	if (isSuccess(response)) {
		putAccessToken(response.data!.token);
		authStore.set({ ...createInitialState(), isAuthLogin: true, message: response.message });
		return true;
	}
	authStore.set({ ...createInitialState(), message: getErrorMessage(response) });
	return false;
}

export async function register(name: string, email: string, password: string): Promise<boolean> {
	authStore.set({ ...createInitialState(), isAuthLoading: true });
	const response = await authApi.register(name, email, password);
	const ok = isSuccess(response);
	authStore.set({
		...createInitialState(),
		isAuthRegister: ok,
		message: ok ? response.message : getErrorMessage(response)
	});
	return ok;
}

export async function logout(): Promise<void> {
	await authApi.logout();
	putAccessToken(null);
	resetUsersStore();
	authStore.set({ ...createInitialState(), isAuthLogout: true });
}
