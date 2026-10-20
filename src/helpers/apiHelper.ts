export interface ApiResponse<T = unknown> {
	status?: 'success' | 'fail' | 'error';
	message: string;
	data?: T;
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	body?: unknown;
	formData?: FormData;
	query?: QueryParams;
	auth?: boolean;
}

const TOKEN_KEY = 'delcom_courses_token';

export const getBaseUrl = (): string => import.meta.env.VITE_DELCOM_BASEURL;

export const getAccessToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const putAccessToken = (token: string | null): void => {
	if (token) {
		localStorage.setItem(TOKEN_KEY, token);
	} else {
		localStorage.removeItem(TOKEN_KEY);
	}
};

export function buildUrl(path: string, query?: QueryParams): string {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query ?? {})) {
		if (value === undefined || value === null || value === '') continue;
		params.append(key, String(value));
	}
	const queryString = params.toString();
	return `${getBaseUrl()}${path}${queryString ? `?${queryString}` : ''}`;
}

export async function apiRequest<T = unknown>(
	path: string,
	options: RequestOptions = {}
): Promise<ApiResponse<T>> {
	const { method = 'GET', body, formData, query, auth = true } = options;
	const headers: Record<string, string> = { Accept: 'application/json' };
	const token = getAccessToken();
	if (auth && token) headers.Authorization = `Bearer ${token}`;

	let payload: BodyInit | undefined;
	if (formData) {
		payload = formData;
	} else if (body !== undefined) {
		headers['Content-Type'] = 'application/json';
		payload = JSON.stringify(body);
	}

	try {
		const response = await fetch(buildUrl(path, query), { method, headers, body: payload });
		return (await response.json()) as ApiResponse<T>;
	} catch {
		return {
			status: 'error',
			message: 'Tidak dapat terhubung ke server. Periksa koneksi internet kamu.'
		};
	}
}

export const isSuccess = (response: ApiResponse<unknown>): boolean =>
	response.status === 'success';

/** Gabungkan pesan validasi (`data.<field>[]`) bila ada, jika tidak pakai `message`. */
export function getErrorMessage(response: ApiResponse<unknown>): string {
	const details =
		response.data && typeof response.data === 'object'
			? Object.values(response.data as Record<string, unknown>)
					.flat()
					.filter((item): item is string => typeof item === 'string')
			: [];
	return details.length > 0 ? details.join('\n') : response.message;
}
