/*
  # Create Blog Posts, Testimonials, and Contact Messages Tables

  ## Overview
  Content management tables for public-facing editorial and marketing content,
  plus a contact form submissions inbox.

  ## New Tables

  ### `blog_posts`
  - `id` (serial, PK)
  - `title` (text)
  - `content` (text) — full HTML/markdown body
  - `excerpt` (text) — short summary for listing views
  - `img` (text) — featured image path
  - `views` (int) — view counter
  - `published_at` (timestamptz) — when it went live (NULL = draft)
  - `created_at` / `updated_at` (timestamptz)

  ### `testimonials`
  - `id` (serial, PK)
  - `review` (text) — the testimonial text
  - `author_name` (text)
  - `author_role` (text)
  - `author_img` (text)
  - `sort_order` (int) — display order
  - `is_active` (boolean) — show/hide toggle
  - `created_at` (timestamptz)

  ### `contact_messages`
  - `id` (uuid, PK)
  - `first_name`, `last_name` (text)
  - `subject` (text)
  - `phone` (text)
  - `message` (text)
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - Blog posts and testimonials: public read, service-role write
  - Contact messages: insert-only for anon/authenticated, read restricted
*/

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id            serial PRIMARY KEY,
  title         text NOT NULL,
  content       text NOT NULL DEFAULT '',
  excerpt       text NOT NULL DEFAULT '',
  img           text NOT NULL DEFAULT '',
  views         int NOT NULL DEFAULT 0,
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (published_at IS NOT NULL AND published_at <= now());

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id           serial PRIMARY KEY,
  review       text NOT NULL,
  author_name  text NOT NULL,
  author_role  text NOT NULL DEFAULT '',
  author_img   text NOT NULL DEFAULT '',
  sort_order   int NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_testimonials_sort_order ON testimonials(sort_order);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  text NOT NULL,
  last_name   text NOT NULL DEFAULT '',
  subject     text NOT NULL DEFAULT '',
  phone       text NOT NULL DEFAULT '',
  message     text NOT NULL,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
