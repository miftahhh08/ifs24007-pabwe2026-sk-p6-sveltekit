import { apiRequest } from '../../../helpers/apiHelper';
import type { Course, CourseContent, CourseDetail } from '../states/coursesStore';

export type Id = number | string;

export const postCourse = (title: string, description: string) =>
	apiRequest('/courses', { method: 'POST', body: { title, description } });

export const postCover = (id: Id, file: File) => {
	const formData = new FormData();
	formData.append('cover', file);
	return apiRequest(`/courses/${id}/cover`, { method: 'POST', formData });
};

export const putCourse = (id: Id, title: string, description: string) =>
	apiRequest(`/courses/${id}`, { method: 'PUT', body: { title, description } });

export const getCourses = (isMe = false) =>
	apiRequest<{ courses: Course[] }>('/courses', { query: { is_me: isMe ? 1 : undefined } });

export const getCourse = (id: Id) => apiRequest<{ course: CourseDetail }>(`/courses/${id}`);

export const deleteCourse = (id: Id) => apiRequest(`/courses/${id}`, { method: 'DELETE' });

export const deleteAllCourses = () => apiRequest('/courses', { method: 'DELETE' });

export const postStudent = (id: Id) => apiRequest(`/courses/${id}/students`, { method: 'POST' });

export const deleteStudent = (id: Id) =>
	apiRequest(`/courses/${id}/students`, { method: 'DELETE' });

export const putRating = (id: Id, ratings: number, comment: string) =>
	apiRequest(`/courses/${id}/students/ratings`, { method: 'PUT', body: { ratings, comment } });

export const postContent = (courseId: Id, title: string, youtube: string) =>
	apiRequest(`/courses/${courseId}/contents`, { method: 'POST', body: { title, youtube } });

export const putContent = (id: Id, title: string, youtube: string) =>
	apiRequest(`/courses/-/contents/${id}`, { method: 'PUT', body: { title, youtube } });

export const getContent = (id: Id) =>
	apiRequest<{ course_content: CourseContent }>(`/courses/-/contents/${id}`);

export const deleteContent = (id: Id) =>
	apiRequest(`/courses/-/contents/${id}`, { method: 'DELETE' });

export const postContentStatus = (id: Id, status: 0 | 1) =>
	apiRequest(`/courses/-/contents/${id}/learns`, { method: 'POST', body: { status } });
