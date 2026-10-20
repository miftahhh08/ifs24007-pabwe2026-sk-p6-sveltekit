import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	failResponse,
	okResponse,
	otherUser,
	sampleContent,
	sampleCourse,
	sampleDetail,
	sampleUser
} from '../../../test-utils';
import * as courseApi from '../api/courseApi';
import * as store from './coursesStore';

vi.mock('../api/courseApi');

const file = new File(['x'], 'c.png', { type: 'image/png' });

describe('coursesStore', () => {
	beforeEach(() => {
		store.resetCoursesStore();
	});

	it('fetchCourses mengisi koleksi saat sukses dan mengosongkan saat gagal', async () => {
		vi.mocked(courseApi.getCourses).mockResolvedValue(okResponse({ courses: [sampleCourse] }));
		await store.fetchCourses(true);
		expect(courseApi.getCourses).toHaveBeenCalledWith(true);
		expect(get(store.coursesStore).courses).toEqual([sampleCourse]);
		expect(get(store.coursesStore).isCourse).toBe(false);

		vi.mocked(courseApi.getCourses).mockResolvedValue(failResponse());
		await store.fetchCourses();
		expect(get(store.coursesStore).courses).toEqual([]);
	});

	it('fetchCourse mengisi detail saat sukses dan null saat gagal', async () => {
		vi.mocked(courseApi.getCourse).mockResolvedValue(okResponse({ course: sampleDetail }));
		await store.fetchCourse(3);
		expect(get(store.coursesStore).course).toEqual(sampleDetail);

		vi.mocked(courseApi.getCourse).mockResolvedValue(failResponse());
		await store.fetchCourse(3);
		expect(get(store.coursesStore).course).toBeNull();
	});

	it('fetchContent mengisi konten saat sukses dan null saat gagal', async () => {
		vi.mocked(courseApi.getContent).mockResolvedValue(okResponse({ course_content: sampleContent }));
		await store.fetchContent(4);
		expect(get(store.coursesStore).content).toEqual(sampleContent);
		expect(get(store.coursesStore).isContent).toBe(false);

		vi.mocked(courseApi.getContent).mockResolvedValue(failResponse());
		await store.fetchContent(4);
		expect(get(store.coursesStore).content).toBeNull();
	});

	it('clearCourseDetail mengosongkan detail', async () => {
		vi.mocked(courseApi.getCourse).mockResolvedValue(okResponse({ course: sampleDetail }));
		await store.fetchCourse(3);
		store.clearCourseDetail();
		expect(get(store.coursesStore).course).toBeNull();
	});

	const cases: [string, () => Promise<unknown>, () => unknown, string, string][] = [
		['addCourse', () => store.addCourse('J', 'D'), () => courseApi.postCourse, 'isCourseAdd', 'isCourseAdded'],
		['changeCourse', () => store.changeCourse(3, 'J', 'D'), () => courseApi.putCourse, 'isCourseChange', 'isCourseChanged'],
		['changeCover', () => store.changeCover(3, file), () => courseApi.postCover, 'isCourseChangeCover', 'isCourseChangedCover'],
		['deleteCourse', () => store.deleteCourse(3), () => courseApi.deleteCourse, 'isCourseDelete', 'isCourseDeleted'],
		['deleteAllCourses', () => store.deleteAllCourses(), () => courseApi.deleteAllCourses, 'isCourseDeleteAll', 'isCourseDeletedAll'],
		['joinCourse', () => store.joinCourse(3), () => courseApi.postStudent, 'isStudentAdd', 'isStudentAdded'],
		['leaveCourse', () => store.leaveCourse(3), () => courseApi.deleteStudent, 'isStudentDelete', 'isStudentDeleted'],
		['changeRating', () => store.changeRating(3, 5, 'ok'), () => courseApi.putRating, 'isRatingChange', 'isRatingChanged'],
		['addContent', () => store.addContent(3, 'J', 'u'), () => courseApi.postContent, 'isContentAdd', 'isContentAdded'],
		['changeContent', () => store.changeContent(4, 'J', 'u'), () => courseApi.putContent, 'isContentChange', 'isContentChanged'],
		['deleteContent', () => store.deleteContent(4), () => courseApi.deleteContent, 'isContentDelete', 'isContentDeleted'],
		['changeContentStatus', () => store.changeContentStatus(4, 1), () => courseApi.postContentStatus, 'isContentStatusChange', 'isContentStatusChanged']
	];

	it.each(cases)('%s mengatur bendera mutasi (sukses dan gagal)', async (_name, run, getApi, busy, done) => {
		const apiFn = getApi() as ReturnType<typeof vi.fn>;

		apiFn.mockResolvedValue(okResponse());
		await run();
		expect(apiFn).toHaveBeenCalled();
		expect(get(store.coursesStore)[busy as keyof store.CoursesState]).toBe(false);
		expect(get(store.coursesStore)[done as keyof store.CoursesState]).toBe(true);

		apiFn.mockResolvedValue(failResponse());
		await run();
		expect(get(store.coursesStore)[done as keyof store.CoursesState]).toBe(false);
	});

	describe('getCourseRole', () => {
		it('guest bila data belum lengkap', () => {
			expect(store.getCourseRole(null, sampleUser)).toBe('guest');
			expect(store.getCourseRole(sampleDetail, null)).toBe('guest');
		});

		it('owner didahulukan walau juga terdaftar sebagai peserta', () => {
			const both = { ...sampleDetail, students: [sampleUser.id] };
			expect(store.getCourseRole(both, sampleUser)).toBe('owner');
		});

		it('student bila id ada di daftar peserta', () => {
			expect(store.getCourseRole(sampleDetail, otherUser)).toBe('student');
		});

		it('guest bila bukan pemilik maupun peserta', () => {
			expect(store.getCourseRole(sampleDetail, { ...otherUser, id: 77 })).toBe('guest');
		});
	});
});
