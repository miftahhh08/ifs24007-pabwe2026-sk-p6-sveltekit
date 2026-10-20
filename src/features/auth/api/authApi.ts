import { apiRequest } from '../../../helpers/apiHelper';
import type { User } from '../../users/states/usersStore';

export interface LoginData {
	user: User;
	token: string;
}

export const login = (email: string, password: string) =>
	apiRequest<LoginData>('/auth/login', { method: 'POST', body: { email, password }, auth: false });

export const register = (name: string, email: string, password: string) =>
	apiRequest('/auth/register', {
		method: 'POST',
		body: { name, email, password },
		auth: false
	});

export const logout = () => apiRequest('/auth/logout', { method: 'POST' });
