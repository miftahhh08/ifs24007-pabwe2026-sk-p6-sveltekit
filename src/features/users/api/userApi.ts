import { apiRequest } from '../../../helpers/apiHelper';
import type { User } from '../states/usersStore';

export const getUsers = () => apiRequest<{ users: User[] }>('/users');

export const getProfile = () => apiRequest<{ user: User }>('/users/me');

export const putProfile = (name: string, email: string) =>
	apiRequest<{ user: User }>('/users/me', { method: 'PUT', body: { name, email } });

export const postPhoto = (file: File) => {
	const formData = new FormData();
	formData.append('photo', file);
	return apiRequest('/users/me/photo', { method: 'POST', formData });
};

export const putPassword = (password: string, newPassword: string, confirmation: string) =>
	apiRequest('/users/password', {
		method: 'PUT',
		body: {
			password,
			new_password: newPassword,
			new_password_confirmation: confirmation
		}
	});
