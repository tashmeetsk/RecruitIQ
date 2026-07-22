--
-- PostgreSQL database dump
--

\restrict r8F3gnchuAlfhob08cXfoFYKaXNo7zTCc6LdgkHt7aN2HhcUOl3AWrFcKmkLByk

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: candidate_job_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_job_status (
    id integer NOT NULL,
    candidate_id integer NOT NULL,
    job_id integer NOT NULL,
    status text NOT NULL,
    updated_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.candidate_job_status OWNER TO postgres;

--
-- Name: candidate_job_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidate_job_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidate_job_status_id_seq OWNER TO postgres;

--
-- Name: candidate_job_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidate_job_status_id_seq OWNED BY public.candidate_job_status.id;


--
-- Name: candidate_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_preferences (
    id integer NOT NULL,
    candidate_id integer NOT NULL,
    desired_role text,
    desired_role_category text,
    salary_expectation text,
    notice_period text,
    wfh_preference text,
    relocation_willingness boolean,
    shift_preference text,
    career_interests text,
    last_verified_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.candidate_preferences OWNER TO postgres;

--
-- Name: candidate_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidate_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidate_preferences_id_seq OWNER TO postgres;

--
-- Name: candidate_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidate_preferences_id_seq OWNED BY public.candidate_preferences.id;


--
-- Name: candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidates (
    id integer NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    resume_text text,
    skills text,
    source text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.candidates OWNER TO postgres;

--
-- Name: candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidates_id_seq OWNER TO postgres;

--
-- Name: candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;


--
-- Name: job_openings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_openings (
    id integer NOT NULL,
    title text NOT NULL,
    role_category text,
    requirements text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.job_openings OWNER TO postgres;

--
-- Name: job_openings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_openings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_openings_id_seq OWNER TO postgres;

--
-- Name: job_openings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_openings_id_seq OWNED BY public.job_openings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: candidate_job_status id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_job_status ALTER COLUMN id SET DEFAULT nextval('public.candidate_job_status_id_seq'::regclass);


--
-- Name: candidate_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_preferences ALTER COLUMN id SET DEFAULT nextval('public.candidate_preferences_id_seq'::regclass);


--
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);


--
-- Name: job_openings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_openings ALTER COLUMN id SET DEFAULT nextval('public.job_openings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: candidate_job_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_job_status (id, candidate_id, job_id, status, updated_by, updated_at) FROM stdin;
1	1	1	interested	Tashmeet	2026-07-20 12:44:20.909912+00
2	2	2	contacted	Alex	2026-07-21 12:44:20.909912+00
3	3	3	open_for_future	Jordan	2026-07-15 12:44:20.909912+00
\.


--
-- Data for Name: candidate_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_preferences (id, candidate_id, desired_role, desired_role_category, salary_expectation, notice_period, wfh_preference, relocation_willingness, shift_preference, career_interests, last_verified_at, updated_at) FROM stdin;
1	1	HR Business Partner	HR	18-22 LPA	30 days	hybrid	t	day	Looking to move into CHRO track in 3-5 years. Interested in building culture programs.	2026-07-20 12:44:17.743213+00	2026-07-22 12:44:17.743213+00
2	2	Senior Backend Developer	Backend Developer	25-30 LPA	immediate	remote	f	flexible	Wants to grow into platform engineering and distributed systems.	2026-07-17 12:44:17.743213+00	2026-07-22 12:44:17.743213+00
3	3	Sales Development Representative	Sales	8-10 LPA + incentives	15 days	hybrid	t	day	Aiming for an Account Executive role within 1-2 years. Passionate about SaaS.	2026-07-12 12:44:17.743213+00	2026-07-22 12:44:17.743213+00
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidates (id, name, email, phone, resume_text, skills, source, created_at, updated_at) FROM stdin;
1	Priya Sharma	priya.sharma@email.com	+91-9876543210	Priya Sharma - Senior HR Professional with 7 years of experience in HR Business Partnering...	HR strategy, talent acquisition, employee relations, HRMS, performance management	resume	2026-07-22 12:43:43.5924+00	2026-07-22 12:43:43.5924+00
2	Rohit Verma	rohit.verma@gmail.com	+91-9812345678	Rohit Verma - Backend Developer with 4 years of experience building scalable APIs...	Node.js, TypeScript, PostgreSQL, REST APIs, Docker, AWS	resume	2026-07-22 12:43:43.5924+00	2026-07-22 12:43:43.5924+00
3	Ananya Gupta	ananya.g@outlook.com	+91-9934567890	Chat notes from recruiter: Ananya reached out via LinkedIn. Previously at Freshworks...	B2B sales, CRM, lead generation, Salesforce, cold outreach	chat	2026-07-22 12:43:43.5924+00	2026-07-22 12:43:43.5924+00
\.


--
-- Data for Name: job_openings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_openings (id, title, role_category, requirements, created_at) FROM stdin;
1	Senior HR Business Partner	HR	Minimum 5 years HRBP experience. Strong stakeholder management and change management skills. Experience with HRMS systems.	2026-07-22 12:43:40.34417+00
2	Backend Developer - Node.js	Backend Developer	3+ years Node.js/TypeScript. Experience with PostgreSQL, REST APIs, and cloud platforms. Strong problem-solving skills.	2026-07-22 12:43:40.34417+00
3	Sales Development Representative	Sales	Prior B2B SaaS sales experience preferred. Excellent communication and CRM skills. Target-driven mindset.	2026-07-22 12:43:40.34417+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, created_at) FROM stdin;
\.


--
-- Name: candidate_job_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidate_job_status_id_seq', 3, true);


--
-- Name: candidate_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidate_preferences_id_seq', 3, true);


--
-- Name: candidates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidates_id_seq', 3, true);


--
-- Name: job_openings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_openings_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: candidate_job_status candidate_job_status_candidate_id_job_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_job_status
    ADD CONSTRAINT candidate_job_status_candidate_id_job_id_unique UNIQUE (candidate_id, job_id);


--
-- Name: candidate_job_status candidate_job_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_job_status
    ADD CONSTRAINT candidate_job_status_pkey PRIMARY KEY (id);


--
-- Name: candidate_preferences candidate_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_preferences
    ADD CONSTRAINT candidate_preferences_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: job_openings job_openings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: candidate_job_status candidate_job_status_candidate_id_candidates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_job_status
    ADD CONSTRAINT candidate_job_status_candidate_id_candidates_id_fk FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- Name: candidate_job_status candidate_job_status_job_id_job_openings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_job_status
    ADD CONSTRAINT candidate_job_status_job_id_job_openings_id_fk FOREIGN KEY (job_id) REFERENCES public.job_openings(id) ON DELETE CASCADE;


--
-- Name: candidate_preferences candidate_preferences_candidate_id_candidates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_preferences
    ADD CONSTRAINT candidate_preferences_candidate_id_candidates_id_fk FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict r8F3gnchuAlfhob08cXfoFYKaXNo7zTCc6LdgkHt7aN2HhcUOl3AWrFcKmkLByk

