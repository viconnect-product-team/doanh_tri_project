CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL DEFAULT '', tag_en text,
  title text NOT NULL, title_en text,
  description text NOT NULL DEFAULT '', description_en text,
  start_date text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '', duration_en text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL DEFAULT '', tag_en text,
  title text NOT NULL, title_en text,
  excerpt text NOT NULL DEFAULT '', excerpt_en text,
  body text NOT NULL DEFAULT '', body_en text,
  published_on date NOT NULL DEFAULT current_date,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT '', category_en text,
  name text NOT NULL, name_en text,
  role text NOT NULL DEFAULT '', role_en text,
  org text NOT NULL DEFAULT '', org_en text,
  bio text NOT NULL DEFAULT '', bio_en text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.courses, public.posts, public.experts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses, public.posts, public.experts TO authenticated;
GRANT ALL ON public.courses, public.posts, public.experts TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published courses" ON public.courses FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Staff read all courses" ON public.courses FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff insert courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff update courses" ON public.courses FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff delete courses" ON public.courses FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));

CREATE POLICY "Public read published posts" ON public.posts FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Staff read all posts" ON public.posts FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff insert posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff update posts" ON public.posts FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff delete posts" ON public.posts FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));

CREATE POLICY "Public read published experts" ON public.experts FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Staff read all experts" ON public.experts FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff insert experts" ON public.experts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff update experts" ON public.experts FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff delete experts" ON public.experts FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));

CREATE TRIGGER courses_touch BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER posts_touch BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER experts_touch BEFORE UPDATE ON public.experts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.courses (sort_order, tag, tag_en, title, title_en, description, description_en, start_date, duration, duration_en) VALUES
(1,'Lãnh đạo & Quản trị','Leadership & Management','Lãnh đạo kiến tạo trong thời đại mới','Transformational leadership for a new era','Phát triển tư duy chiến lược, năng lực lãnh đạo và quản trị trong bối cảnh biến động.','Develop strategic thinking, leadership and management skills in a volatile environment.','15/01/2027','3 tháng','3 months'),
(2,'Chuyển đổi số & AI','Digital & AI','AI cho lãnh đạo doanh nghiệp','AI for business leaders','Ứng dụng AI để tối ưu vận hành, đổi mới mô hình kinh doanh và tạo lợi thế cạnh tranh.','Use AI to optimize operations, innovate business models and gain competitive advantage.','20/02/2027','2 tháng','2 months'),
(3,'Kinh tế xanh & ESG','Green economy & ESG','ESG và phát triển bền vững','ESG and sustainable development','Chiến lược và giải pháp thực tiễn cho doanh nghiệp Việt Nam.','Practical strategies and solutions for Vietnamese businesses.','20/02/2027','2 tháng','2 months'),
(4,'Đổi mới sáng tạo','Innovation','Thiết kế mô hình kinh doanh mới','Designing new business models','Phương pháp và công cụ để tạo ra các mô hình kinh doanh đột phá.','Methods and tools to create breakthrough business models.','10/04/2027','2 tháng','2 months');

INSERT INTO public.experts (sort_order, category, category_en, name, role, role_en, org, org_en, bio, bio_en) VALUES
(1,'Nhà khoa học','Scientist','GS. Trần Văn Minh','Chuyên gia Kinh tế vĩ mô','Macroeconomics expert','Đại học Kinh tế Quốc dân','National Economics University','Hơn 30 năm nghiên cứu về kinh tế và chính sách phát triển.','Over 30 years of research in economics and development policy.'),
(2,'Chuyên gia chính sách','Policy expert','TS. Nguyễn Thị Lan Anh','Chuyên gia Chính sách công','Public policy expert','Học viện Chính trị Quốc gia','Ho Chi Minh National Academy of Politics','Nghiên cứu và tư vấn chính sách phát triển kinh tế - xã hội.','Research and advice on socio-economic development policy.'),
(3,'Lãnh đạo doanh nghiệp','Business leader','Ông Nguyễn Hoàng Nam','Tổng Giám đốc','CEO','Tập đoàn Công nghệ Việt','Viet Technology Group','Hơn 20 năm kinh nghiệm trong chuyển đổi số và đổi mới sáng tạo.','Over 20 years of experience in digital transformation and innovation.'),
(4,'Chuyên gia quốc tế','International expert','Prof. Michael Chen','Chuyên gia Đổi mới sáng tạo','Innovation expert','Stanford University (Hoa Kỳ)','Stanford University (USA)','Nghiên cứu về đổi mới sáng tạo và hệ sinh thái khởi nghiệp.','Research on innovation and startup ecosystems.'),
(5,'Lãnh đạo doanh nghiệp','Business leader','TS. Lê Thị Thu Hương','Chuyên gia Quản trị doanh nghiệp','Corporate governance expert','INSEAD (Pháp)','INSEAD (France)','Chuyên về quản trị, phát triển lãnh đạo và văn hoá doanh nghiệp.','Specialist in governance, leadership development and corporate culture.'),
(6,'Chuyên gia quốc tế','International expert','Dr. Kenji Watanabe','Chuyên gia Kinh tế xanh','Green economy expert','The University of Tokyo (Nhật Bản)','The University of Tokyo (Japan)','Nghiên cứu về kinh tế xanh và chính sách môi trường.','Research on the green economy and environmental policy.');

INSERT INTO public.posts (published_on, tag, tag_en, title, title_en, excerpt, excerpt_en) VALUES
('2026-04-25','Hội thảo','Conference','Chuyển đổi số trong quản trị doanh nghiệp bền vững','Digital transformation in sustainable corporate governance','Quy tụ các nhà lãnh đạo, chuyên gia và doanh nghiệp để thảo luận cơ hội và thách thức trong chuyển đổi số.','Leaders, experts and businesses discuss the opportunities and challenges of digital transformation.'),
('2026-03-28','Chuyên đề','Special topic','Chuyển đổi xanh trong doanh nghiệp Việt Nam','Green transition in Vietnamese businesses','Những mô hình và giải pháp thực tiễn giúp doanh nghiệp chuyển đổi xanh.','Practical models and solutions for the green transition.'),
('2026-02-20','Đào tạo','Training','Khai giảng chương trình AI cho lãnh đạo doanh nghiệp','AI for business leaders program launches','Chương trình giúp lãnh đạo ứng dụng AI để tối ưu vận hành và đổi mới mô hình kinh doanh.','Helping leaders apply AI to optimize operations and innovate business models.');