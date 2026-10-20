import { writable } from 'svelte/store';
import { isSuccess, putAccessToken, type ApiResponse } from '../../../helpers/apiHelper';
import * as userApi from '../api/userApi';

export interface User {
	id: number;
	name: string;
	email: string;
	email_verified_at: string | null;
	photo: string | null;
	created_at: string;
	updated_at: string;
}

export interface UsersState {
	users: User[];
	profile: User | null;
	isUsersLoading: boolean;
	isProfileLoading: boolean;
	isProfileFailed: boolean;
	isProfileChange: boolean;
	isProfileChanged: boolean;
	isPhotoChange: boolean;
	isPhotoChanged: boolean;
	isPasswordChange: boolean;
	isPasswordChanged: boolean;
}

const createInitialState = (): UsersState => ({
	users: [],
	profile: null,
	isUsersLoading: false,
	isProfileLoading: false,
	isProfileFailed: false,
	isProfileChange: false,
	isProfileChanged: false,
	isPhotoChange: false,
	isPhotoChanged: false,
	isPasswordChange: false,
	isPasswordChanged: false
});

export const usersStore = writable<UsersState>(createInitialState());

export const resetUsersStore = () => usersStore.set(createInitialState());

type FlagKey = {
	[K in keyof UsersState]: UsersState[K] extends boolean ? K : never;
}[keyof UsersState];

async function mutate<T>(
	busy: FlagKey,
	done: FlagKey,
	run: () => Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> {
	usersStore.update((state) => ({ ...state, [busy]: true, [done]: false }));
	const response = await run();
	usersStore.update((state) => ({ ...state, [busy]: false, [done]: isSuccess(response) }));
	return response;
}

export async function fetchUsers() {
	usersStore.update((state) => ({ ...state, isUsersLoading: true }));
	const response = await userApi.getUsers();
	usersStore.update((state) => ({
		...state,
		users: isSuccess(response) ? response.data!.users : [],
		isUsersLoading: false
	}));
	return response;
}

export async function fetchProfile() {
	usersStore.update((state) => ({ ...state, isProfileLoading: true, isProfileFailed: false }));
	const response = await userApi.getProfile();
	if (isSuccess(response)) {
		usersStore.update((state) => ({
			...state,
			profile: response.data!.user,
			isProfileLoading: false
		}));
	} else {
		putAccessToken(null);
		usersStore.update((state) => ({
			...state,
			profile: null,
			isProfileLoading: false,
			isProfileFailed: true
		}));
	}
	return response;
}

export async function changeProfile(name: string, email: string) {
	const response = await mutate('isProfileChange', 'isProfileChanged', () =>
		userApi.putProfile(name, email)
	);
	if (isSuccess(response)) {
		usersStore.update((state) => ({ ...state, profile: response.data!.user }));
	}
	return response;
}

export async function changePhoto(file: File) {
	const response = await mutate('isPhotoChange', 'isPhotoChanged', () => userApi.postPhoto(file));
	if (isSuccess(response)) await fetchProfile();
	return response;
}

export const changePassword = (password: string, newPassword: string, confirmation: string) =>
	mutate('isPasswordChange', 'isPasswordChanged', () =>
		userApi.putPassword(password, newPassword, confirmation)
	);
