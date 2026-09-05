-- The Cocoon LMS — database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)

-- ============================================================
-- Profiles (extends Supabase auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_initials text,
  role text not null default 'student' check (role in ('student', 'instructor', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- Courses
-- ============================================================
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  instructor_name text,
  instructor_craft text,
  hue text default '#C9A135',
  price_cents integer not null default 1000,
  currency text not null default 'usd',
  published boolean not null default false,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Modules (groups of lessons within a course)
-- ============================================================
create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  title text not null,
  position integer not null default 0
);

-- ============================================================
-- Lessons
-- ============================================================
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  title text not null,
  video_url text,
  duration_seconds integer default 0,
  position integer not null default 0
);

-- ============================================================
-- Enrollments (who has access to which course)
-- ============================================================
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ============================================================
-- Lesson progress
-- ============================================================
create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;

-- Profiles: users can read/update their own profile
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Courses: published courses are public; admins/instructors manage their own
create policy "courses_select_published" on courses
  for select using (published = true or created_by = auth.uid());
create policy "courses_insert_staff" on courses
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role in ('instructor', 'admin'))
  );
create policy "courses_update_staff" on courses
  for update using (
    created_by = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Modules & lessons: readable if the parent course is readable
create policy "modules_select" on modules
  for select using (
    exists (
      select 1 from courses
      where courses.id = modules.course_id
      and (courses.published = true or courses.created_by = auth.uid())
    )
  );
create policy "modules_write_staff" on modules
  for all using (
    exists (
      select 1 from courses
      where courses.id = modules.course_id
      and (courses.created_by = auth.uid()
        or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

create policy "lessons_select" on lessons
  for select using (
    exists (
      select 1 from courses
      where courses.id = lessons.course_id
      and (courses.published = true or courses.created_by = auth.uid())
    )
  );
create policy "lessons_write_staff" on lessons
  for all using (
    exists (
      select 1 from courses
      where courses.id = lessons.course_id
      and (courses.created_by = auth.uid()
        or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

-- Enrollments: users see their own; inserted by the webhook (service role) or by the user themself for free courses
create policy "enrollments_select_own" on enrollments
  for select using (auth.uid() = user_id);
create policy "enrollments_insert_own" on enrollments
  for insert with check (auth.uid() = user_id);

-- Lesson progress: users manage their own
create policy "progress_select_own" on lesson_progress
  for select using (auth.uid() = user_id);
create policy "progress_upsert_own" on lesson_progress
  for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on lesson_progress
  for update using (auth.uid() = user_id);

-- ============================================================
-- Seed data (safe to skip in production)
-- ============================================================
insert into courses (slug, title, description, instructor_name, instructor_craft, hue, price_cents, published)
values
  ('art-of-presence', 'The Art of Presence', 'Learn to hold a room, a conversation, and yourself.', 'Mara Voss', 'Michelin-starred chef', '#C9A135', 1000, true)
on conflict (slug) do nothing;
