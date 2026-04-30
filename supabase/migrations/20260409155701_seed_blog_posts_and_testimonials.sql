/*
  # Seed Blog Posts and Testimonials

  Migrates all hardcoded data from blogData.ts and testimonialsData.ts into the database.

  ## Blog Posts Seeded: 9
  All posts from the original blogData.ts array with proper published_at timestamps.

  ## Testimonials Seeded: 6
  All testimonials from testimonialsData.ts with author info and review text.
*/

-- Seed Blog Posts
INSERT INTO blog_posts (title, img, excerpt, views, published_at) VALUES
(
  'Vel eu amet sit amet dui cursus vitae consequat',
  '/images/blog/blog-01.jpg',
  'Vel eu amet sit amet dui cursus vitae consequat diam amet ut enim commodo lorem.',
  50000,
  '2022-03-27 00:00:00+00'
),
(
  'Vel eu amet sit amet dui cursus vitae consequat',
  '/images/blog/blog-02.jpg',
  'Vel eu amet sit amet dui cursus vitae consequat diam amet ut enim commodo lorem.',
  100000,
  '2022-03-27 00:00:00+00'
),
(
  'Vel eu amet sit amet dui cursus vitae consequat',
  '/images/blog/blog-03.jpg',
  'Vel eu amet sit amet dui cursus vitae consequat diam amet ut enim commodo lorem.',
  150000,
  '2022-03-27 00:00:00+00'
),
(
  'Vel eu amet sit amet dui cursus vitae consequat',
  '/images/blog/blog-04.jpg',
  'Vel eu amet sit amet dui cursus vitae consequat diam amet ut enim commodo lorem.',
  200000,
  '2022-03-27 00:00:00+00'
),
(
  'Vel eu amet sit amet dui cursus vitae consequat',
  '/images/blog/blog-05.jpg',
  'Vel eu amet sit amet dui cursus vitae consequat diam amet ut enim commodo lorem.',
  250000,
  '2022-03-27 00:00:00+00'
),
(
  'Vel eu amet sit amet dui cursus vitae consequat',
  '/images/blog/blog-06.jpg',
  'Vel eu amet sit amet dui cursus vitae consequat diam amet ut enim commodo lorem.',
  300000,
  '2022-03-27 00:00:00+00'
),
(
  'Vel eu amet sit amet dui cursus vitae consequat',
  '/images/blog/blog-07.jpg',
  'Vel eu amet sit amet dui cursus vitae consequat diam amet ut enim commodo lorem.',
  100000,
  '2022-03-27 00:00:00+00'
),
(
  'Vel eu amet sit amet dui cursus vitae consequat',
  '/images/blog/blog-08.jpg',
  'Vel eu amet sit amet dui cursus vitae consequat diam amet ut enim commodo lorem.',
  75000,
  '2022-03-27 00:00:00+00'
),
(
  'Vel eu amet sit amet dui cursus vitae consequat',
  '/images/blog/blog-09.jpg',
  'Vel eu amet sit amet dui cursus vitae consequat diam amet ut enim commodo lorem.',
  60000,
  '2022-03-27 00:00:00+00'
);

-- Seed Testimonials
INSERT INTO testimonials (review, author_name, author_role, author_img, sort_order) VALUES
(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  'Davis Dorwart',
  'Serial Entrepreneur',
  '/images/users/user-01.jpg',
  1
),
(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  'Wilson Dias',
  'Backend Developer',
  '/images/users/user-02.jpg',
  2
),
(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  'Miracle Exterm',
  'Entrepreneur',
  '/images/users/user-03.jpg',
  3
),
(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  'Thomas Frank',
  'Serial Entrepreneur',
  '/images/users/user-04.jpg',
  4
),
(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  'Dave Smith',
  'Backend Developer',
  '/images/users/user-01.jpg',
  5
),
(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  'Davis Dorwart',
  'Entrepreneur',
  '/images/users/user-02.jpg',
  6
);
