import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../../helpers/apiHelper';
import * as api from './courseApi';

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }));

describe('courseApi', () => {
	beforeEach(() => {
		vi.mocked(apiRequest).mockResolvedValue({ status: 'success', message: 'ok' });
	});

	it('postCourse', async () => {
		await api.postCourse('Judul', 'Deskripsi');
		expect(apiRequest).toHaveBeenCalledWith('/courses', {
			method: 'POST',
			body: { title: 'Judul', description: 'Deskripsi' }
		});
	});

	it('postCover mengirim FormData berisi cover', async () => {
		const file = new File(['x'], 'c.png', { type: 'image/png' });
		await api.postCover(3, file);
		const [path, options] = vi.mocked(apiRequest).mock.calls[0];
		expect(path).toBe('/courses/3/cover');
		expect(options?.method).toBe('POST');
		expect(options?.formData?.get('cover')).toBe(file);
	});

	it('putCourse', async () => {
		await api.putCourse(3, 'J', 'D');
		expect(apiRequest).toHaveBeenCalledWith('/courses/3', {
			method: 'PUT',
			body: { title: 'J', description: 'D' }
		});
	});

	it('getCourses tanpa dan dengan filter is_me', async () => {
		await api.getCourses();
		expect(apiRequest).toHaveBeenLastCalledWith('/courses', { query: { is_me: undefined } });
		await api.getCourses(true);
		expect(apiRequest).toHaveBeenLastCalledWith('/courses', { query: { is_me: 1 } });
	});

	it('getCourse', async () => {
		await api.getCourse('3');
		expect(apiRequest).toHaveBeenCalledWith('/courses/3');
	});

	it('deleteCourse dan deleteAllCourses', async () => {
		await api.deleteCourse(3);
		expect(apiRequest).toHaveBeenLastCalledWith('/courses/3', { method: 'DELETE' });
		await api.deleteAllCourses();
		expect(apiRequest).toHaveBeenLastCalledWith('/courses', { method: 'DELETE' });
	});

	it('postStudent dan deleteStudent', async () => {
		await api.postStudent(3);
		expect(apiRequest).toHaveBeenLastCalledWith('/courses/3/students', { method: 'POST' });
		await api.deleteStudent(3);
		expect(apiRequest).toHaveBeenLastCalledWith('/courses/3/students', { method: 'DELETE' });
	});

	it('putRating', async () => {
		await api.putRating(3, 5, 'Mantap');
		expect(apiRequest).toHaveBeenCalledWith('/courses/3/students/ratings', {
			method: 'PUT',
			body: { ratings: 5, comment: 'Mantap' }
		});
	});

	it('operasi konten', async () => {
		await api.postContent(3, 'J', 'https://youtu.be/x');
		expect(apiRequest).toHaveBeenLastCalledWith('/courses/3/contents', {
			method: 'POST',
			body: { title: 'J', youtube: 'https://youtu.be/x' }
		});
		await api.putContent(4, 'J2', 'https://youtu.be/y');
		expect(apiRequest).toHaveBeenLastCalledWith('/courses/-/contents/4', {
			method: 'PUT',
			body: { title: 'J2', youtube: 'https://youtu.be/y' }
		});
		await api.getContent('4');
		expect(apiRequest).toHaveBeenLastCalledWith('/courses/-/contents/4');
		await api.deleteContent(4);
		expect(apiRequest).toHaveBeenLastCalledWith('/courses/-/contents/4', { method: 'DELETE' });
		await api.postContentStatus(4, 1);
		expect(apiRequest).toHaveBeenLastCalledWith('/courses/-/contents/4/learns', {
			method: 'POST',
			body: { status: 1 }
		});
	});
});
