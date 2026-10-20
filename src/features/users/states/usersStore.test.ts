import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper';
import { failResponse, okResponse, sampleUser } from '../../../test-utils';
import * as userApi from '../api/userApi';
import {
	changePassword,
	changePhoto,
	changeProfile,
	fetchProfile,
	fetchUsers,
	resetUsersStore,
	usersStore
} from './usersStore';

vi.mock('../api/userApi');

describe('usersStore', () => {
	beforeEach(() => {
		localStorage.clear();
		resetUsersStore();
	});

	it('fetchUsers mengisi daftar pengguna saat sukses', async () => {
		vi.mocked(userApi.getUsers).mockResolvedValue(okResponse({ users: [sampleUser] }));
		await fetchUsers();
		expect(get(usersStore).users).toEqual([sampleUser]);
		expect(get(usersStore).isUsersLoading).toBe(false);
	});

	it('fetchUsers mengosongkan daftar saat gagal', async () => {
		vi.mocked(userApi.getUsers).mockResolvedValue(failResponse());
		await fetchUsers();
		expect(get(usersStore).users).toEqual([]);
	});

	it('fetchProfile menyimpan profil saat sukses', async () => {
		vi.mocked(userApi.getProfile).mockResolvedValue(okResponse({ user: sampleUser }));
		await fetchProfile();
		expect(get(usersStore).profile).toEqual(sampleUser);
		expect(get(usersStore).isProfileFailed).toBe(false);
	});

	it('fetchProfile menghapus token dan menandai gagal saat error', async () => {
		putAccessToken('abc');
		vi.mocked(userApi.getProfile).mockResolvedValue(failResponse('Unauthenticated.'));
		await fetchProfile();
		expect(getAccessToken()).toBeNull();
		expect(get(usersStore).profile).toBeNull();
		expect(get(usersStore).isProfileFailed).toBe(true);
	});

	it('changeProfile memperbarui profil saat sukses', async () => {
		const updated = { ...sampleUser, name: 'Baru' };
		vi.mocked(userApi.putProfile).mockResolvedValue(okResponse({ user: updated }));
		await changeProfile('Baru', sampleUser.email);
		expect(get(usersStore).profile).toEqual(updated);
		expect(get(usersStore).isProfileChanged).toBe(true);
		expect(get(usersStore).isProfileChange).toBe(false);
	});

	it('changeProfile tidak mengubah profil saat gagal', async () => {
		vi.mocked(userApi.putProfile).mockResolvedValue(failResponse());
		await changeProfile('Baru', 'x');
		expect(get(usersStore).profile).toBeNull();
		expect(get(usersStore).isProfileChanged).toBe(false);
	});

	it('changePhoto memuat ulang profil saat sukses', async () => {
		vi.mocked(userApi.postPhoto).mockResolvedValue(okResponse());
		vi.mocked(userApi.getProfile).mockResolvedValue(okResponse({ user: sampleUser }));
		await changePhoto(new File(['x'], 'a.png'));
		expect(get(usersStore).isPhotoChanged).toBe(true);
		expect(get(usersStore).profile).toEqual(sampleUser);
	});

	it('changePhoto tidak memuat ulang profil saat gagal', async () => {
		vi.mocked(userApi.postPhoto).mockResolvedValue(failResponse());
		await changePhoto(new File(['x'], 'a.png'));
		expect(userApi.getProfile).not.toHaveBeenCalled();
		expect(get(usersStore).isPhotoChanged).toBe(false);
	});

	it('changePassword menandai berhasil', async () => {
		vi.mocked(userApi.putPassword).mockResolvedValue(okResponse());
		await changePassword('a', 'b', 'b');
		expect(userApi.putPassword).toHaveBeenCalledWith('a', 'b', 'b');
		expect(get(usersStore).isPasswordChanged).toBe(true);
	});
});
