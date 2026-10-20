import { createRawSnippet } from 'svelte';
import type {
	Course,
	CourseContent,
	CourseDetail
} from './features/courses/states/coursesStore';
import type { User } from './features/users/states/usersStore';

export const okResponse = <T>(data?: T, message = 'Berhasil') => ({
	status: 'success' as const,
	message,
	data
});

export const failResponse = (message = 'Gagal', data?: unknown) => ({
	status: 'fail' as const,
	message,
	data
});

/** Snippet sederhana untuk komponen yang membutuhkan `children`. */
export const childSnippet = (html = '<p>isi anak</p>') =>
	createRawSnippet(() => ({ render: () => html }));

export const sampleUser: User = {
	id: 1,
	name: 'Ifs Tester',
	email: 'ifs24007@delcom.org',
	email_verified_at: null,
	photo: 'img/profile/1.png',
	created_at: '2026-01-01T00:00:00.000000Z',
	updated_at: '2026-01-02T00:00:00.000000Z'
};

export const otherUser: User = { ...sampleUser, id: 2, name: 'Budi', email: 'budi@delcom.org', photo: null };

export const sampleCourse: Course = {
	id: 3,
	user_id: 1,
	title: 'Dasar C',
	cover: 'https://img.test/cover.jpg',
	description: 'Belajar dasar C dari awal',
	created_at: '2026-01-01T00:00:00.000000Z',
	updated_at: '2026-01-01T00:00:00.000000Z',
	author: { name: 'Ifs Tester', photo: null },
	students: [2],
	total_contents: 2,
	avg_ratings: '4.0000'
};

export const otherCourse: Course = {
	...sampleCourse,
	id: 9,
	user_id: 99,
	title: 'Belajar ReactJS',
	cover: null,
	description: 'React dari nol',
	author: { name: 'Budi Pengajar', photo: null },
	students: [],
	total_contents: undefined,
	avg_ratings: null
};

export const sampleContent: CourseContent = {
	id: 4,
	course_id: 3,
	title: 'Pengenalan C',
	youtube: 'https://youtu.be/uHyfQV0kbgo',
	created_at: '2026-01-01T00:00:00.000000Z',
	updated_at: '2026-01-01T00:00:00.000000Z',
	my_status_finished: true
};

export const unfinishedContent: CourseContent = {
	...sampleContent,
	id: 5,
	title: 'Variabel dan Tipe Data',
	my_status_finished: false
};

export const sampleDetail: CourseDetail = {
	...sampleCourse,
	contents: [sampleContent, unfinishedContent],
	ratings: [{ name: 'Budi', ratings: 4, comment: 'Keren sekali' }],
	avg_ratings: '4.00',
	my_percentage_finished: '50.00'
};
