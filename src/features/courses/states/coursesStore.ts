import { writable } from 'svelte/store';
import { isSuccess, type ApiResponse } from '../../../helpers/apiHelper';
import type { User } from '../../users/states/usersStore';
import * as courseApi from '../api/courseApi';
import type { Id } from '../api/courseApi';

export interface Author {
	name: string;
	photo: string | null;
}

export interface Course {
	id: number;
	user_id: number;
	title: string;
	cover: string | null;
	description: string;
	created_at: string;
	updated_at: string;
	author: Author;
	students: number[];
	total_contents?: number;
	avg_ratings?: string | null;
}

export interface CourseContent {
	id: number;
	course_id: number;
	title: string;
	youtube: string;
	created_at: string;
	updated_at: string;
	my_status_finished: boolean;
}

export interface CourseRating {
	name: string;
	ratings: number;
	comment: string;
}

export interface CourseDetail extends Course {
	contents: CourseContent[];
	ratings: CourseRating[];
	my_percentage_finished: string;
}

export interface CoursesState {
	courses: Course[];
	course: CourseDetail | null;
	content: CourseContent | null;
	isCourse: boolean;
	isContent: boolean;
	isCourseAdd: boolean;
	isCourseAdded: boolean;
	isCourseChange: boolean;
	isCourseChanged: boolean;
	isCourseChangeCover: boolean;
	isCourseChangedCover: boolean;
	isCourseDelete: boolean;
	isCourseDeleted: boolean;
	isCourseDeleteAll: boolean;
	isCourseDeletedAll: boolean;
	isStudentAdd: boolean;
	isStudentAdded: boolean;
	isStudentDelete: boolean;
	isStudentDeleted: boolean;
	isRatingChange: boolean;
	isRatingChanged: boolean;
	isContentAdd: boolean;
	isContentAdded: boolean;
	isContentChange: boolean;
	isContentChanged: boolean;
	isContentDelete: boolean;
	isContentDeleted: boolean;
	isContentStatusChange: boolean;
	isContentStatusChanged: boolean;
}

const createInitialState = (): CoursesState => ({
	courses: [],
	course: null,
	content: null,
	isCourse: false,
	isContent: false,
	isCourseAdd: false,
	isCourseAdded: false,
	isCourseChange: false,
	isCourseChanged: false,
	isCourseChangeCover: false,
	isCourseChangedCover: false,
	isCourseDelete: false,
	isCourseDeleted: false,
	isCourseDeleteAll: false,
	isCourseDeletedAll: false,
	isStudentAdd: false,
	isStudentAdded: false,
	isStudentDelete: false,
	isStudentDeleted: false,
	isRatingChange: false,
	isRatingChanged: false,
	isContentAdd: false,
	isContentAdded: false,
	isContentChange: false,
	isContentChanged: false,
	isContentDelete: false,
	isContentDeleted: false,
	isContentStatusChange: false,
	isContentStatusChanged: false
});

export const coursesStore = writable<CoursesState>(createInitialState());

export const resetCoursesStore = () => coursesStore.set(createInitialState());

export const clearCourseDetail = () =>
	coursesStore.update((state) => ({ ...state, course: null }));

export type CourseRole = 'owner' | 'student' | 'guest';

/** Pemilik lebih diprioritaskan daripada peserta bila keduanya terpenuhi. */
export function getCourseRole(course: CourseDetail | null, profile: User | null): CourseRole {
	if (!course || !profile) return 'guest';
	if (course.user_id === profile.id) return 'owner';
	return course.students.includes(profile.id) ? 'student' : 'guest';
}

type FlagKey = {
	[K in keyof CoursesState]: CoursesState[K] extends boolean ? K : never;
}[keyof CoursesState];

async function mutate<T>(
	busy: FlagKey,
	done: FlagKey,
	run: () => Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> {
	coursesStore.update((state) => ({ ...state, [busy]: true, [done]: false }));
	const response = await run();
	coursesStore.update((state) => ({ ...state, [busy]: false, [done]: isSuccess(response) }));
	return response;
}

export async function fetchCourses(isMe = false) {
	coursesStore.update((state) => ({ ...state, isCourse: true }));
	const response = await courseApi.getCourses(isMe);
	coursesStore.update((state) => ({
		...state,
		courses: isSuccess(response) ? response.data!.courses : [],
		isCourse: false
	}));
	return response;
}

export async function fetchCourse(id: Id) {
	coursesStore.update((state) => ({ ...state, isCourse: true }));
	const response = await courseApi.getCourse(id);
	coursesStore.update((state) => ({
		...state,
		course: isSuccess(response) ? response.data!.course : null,
		isCourse: false
	}));
	return response;
}

export async function fetchContent(id: Id) {
	coursesStore.update((state) => ({ ...state, isContent: true }));
	const response = await courseApi.getContent(id);
	coursesStore.update((state) => ({
		...state,
		content: isSuccess(response) ? response.data!.course_content : null,
		isContent: false
	}));
	return response;
}

export const addCourse = (title: string, description: string) =>
	mutate('isCourseAdd', 'isCourseAdded', () => courseApi.postCourse(title, description));

export const changeCourse = (id: Id, title: string, description: string) =>
	mutate('isCourseChange', 'isCourseChanged', () => courseApi.putCourse(id, title, description));

export const changeCover = (id: Id, file: File) =>
	mutate('isCourseChangeCover', 'isCourseChangedCover', () => courseApi.postCover(id, file));

export const deleteCourse = (id: Id) =>
	mutate('isCourseDelete', 'isCourseDeleted', () => courseApi.deleteCourse(id));

export const deleteAllCourses = () =>
	mutate('isCourseDeleteAll', 'isCourseDeletedAll', () => courseApi.deleteAllCourses());

export const joinCourse = (id: Id) =>
	mutate('isStudentAdd', 'isStudentAdded', () => courseApi.postStudent(id));

export const leaveCourse = (id: Id) =>
	mutate('isStudentDelete', 'isStudentDeleted', () => courseApi.deleteStudent(id));

export const changeRating = (id: Id, ratings: number, comment: string) =>
	mutate('isRatingChange', 'isRatingChanged', () => courseApi.putRating(id, ratings, comment));

export const addContent = (courseId: Id, title: string, youtube: string) =>
	mutate('isContentAdd', 'isContentAdded', () => courseApi.postContent(courseId, title, youtube));

export const changeContent = (id: Id, title: string, youtube: string) =>
	mutate('isContentChange', 'isContentChanged', () => courseApi.putContent(id, title, youtube));

export const deleteContent = (id: Id) =>
	mutate('isContentDelete', 'isContentDeleted', () => courseApi.deleteContent(id));

export const changeContentStatus = (id: Id, status: 0 | 1) =>
	mutate('isContentStatusChange', 'isContentStatusChanged', () =>
		courseApi.postContentStatus(id, status)
	);
