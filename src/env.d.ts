interface ImportMetaEnv {
	readonly VITE_DELCOM_BASEURL: string;
	readonly APP_PORT: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
