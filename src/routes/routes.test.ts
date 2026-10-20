import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { childSnippet } from '../test-utils';
import AuthLayout from '../features/auth/layouts/AuthLayout.svelte';
import LoginPage from '../features/auth/pages/LoginPage.svelte';
import RegisterPage from '../features/auth/pages/RegisterPage.svelte';
import NotFoundPage from '../features/common/pages/NotFoundPage.svelte';
import CourseLayout from '../features/courses/layouts/CourseLayout.svelte';
import ContentPage from '../features/courses/pages/ContentPage.svelte';
import DetailPage from '../features/courses/pages/DetailPage.svelte';
import HomePage from '../features/courses/pages/HomePage.svelte';
import ProfilePage from '../features/users/pages/ProfilePage.svelte';
import UsersPage from '../features/users/pages/UsersPage.svelte';
import { ssr } from './+layout';
import RootLayout from './+layout.svelte';
import AuthRouteLayout from './auth/+layout.svelte';
import LoginRoute from './auth/login/+page.svelte';
import RegisterRoute from './auth/register/+page.svelte';
import ErrorRoute from './+error.svelte';
import HomeRoute from './+page.svelte';
import DetailRoute from './courses/[courseId]/+page.svelte';
import ContentRoute from './courses/[courseId]/contents/[contentId]/+page.svelte';
import ProfileRoute from './profile/+page.svelte';
import UsersRoute from './users/+page.svelte';

const mocks = vi.hoisted(() => ({
	page: { url: { pathname: '/' }, params: {} as Record<string, string> }
}));
vi.mock('$app/state', () => ({ page: mocks.page }));
vi.mock('../features/auth/components/AuthSessionRedirect.svelte', () => ({ default: vi.fn() }));
vi.mock('../features/auth/layouts/AuthLayout.svelte', () => ({ default: vi.fn() }));
vi.mock('../features/auth/pages/LoginPage.svelte', () => ({ default: vi.fn() }));
vi.mock('../features/auth/pages/RegisterPage.svelte', () => ({ default: vi.fn() }));
vi.mock('../features/common/pages/NotFoundPage.svelte', () => ({ default: vi.fn() }));
vi.mock('../features/courses/layouts/CourseLayout.svelte', () => ({ default: vi.fn() }));
vi.mock('../features/courses/pages/ContentPage.svelte', () => ({ default: vi.fn() }));
vi.mock('../features/courses/pages/DetailPage.svelte', () => ({ default: vi.fn() }));
vi.mock('../features/courses/pages/HomePage.svelte', () => ({ default: vi.fn() }));
vi.mock('../features/users/pages/ProfilePage.svelte', () => ({ default: vi.fn() }));
vi.mock('../features/users/pages/UsersPage.svelte', () => ({ default: vi.fn() }));

describe('rute', () => {
	beforeEach(() => {
		mocks.page.url.pathname = '/';
	});

	it('layout root berjalan sebagai SPA (ssr dimatikan)', () => {
		expect(ssr).toBe(false);
	});

	it('rute non-auth dibungkus CourseLayout', () => {
		render(RootLayout, { props: { children: childSnippet() } });
		expect(CourseLayout).toHaveBeenCalled();
	});

	it('rute /auth tidak memakai CourseLayout', () => {
		mocks.page.url.pathname = '/auth/login';
		render(RootLayout, { props: { children: childSnippet() } });
		expect(CourseLayout).not.toHaveBeenCalled();
		expect(screen.getByText('isi anak')).toBeInTheDocument();
	});

	it('layout /auth memakai AuthLayout', () => {
		render(AuthRouteLayout, { props: { children: childSnippet() } });
		expect(AuthLayout).toHaveBeenCalled();
	});

	it.each([
		['/', HomeRoute, HomePage],
		['/auth/login', LoginRoute, LoginPage],
		['/auth/register', RegisterRoute, RegisterPage],
		['/users', UsersRoute, UsersPage],
		['/profile', ProfileRoute, ProfilePage],
		['/courses/[courseId]', DetailRoute, DetailPage],
		['/courses/[courseId]/contents/[contentId]', ContentRoute, ContentPage],
		['+error.svelte', ErrorRoute, NotFoundPage]
	])('%s merender halaman yang sesuai', (_path, Route, Page) => {
		render(Route);
		expect(Page).toHaveBeenCalled();
	});
});
