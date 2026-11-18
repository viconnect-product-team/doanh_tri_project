CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, title_en text,
  tag text NOT NULL DEFAULT '', tag_en text,
  topic text NOT NULL DEFAULT '', topic_en text,
  description text NOT NULL DEFAULT '', description_en text,
  place text NOT NULL DEFAULT '', place_en text,
  mode text NOT NULL DEFAULT '', mode_en text,
  attendees text NOT NULL DEFAULT '', attendees_en text,
  event_date date NOT NULL DEFAULT current_date,
  time_range text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published events" ON public.events FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Staff read all events" ON public.events FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff update events" ON public.events FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff delete events" ON public.events FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE TRIGGER events_touch BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.events (featured, event_date, time_range, title, title_en, tag, tag_en, topic, topic_en, description, description_en, place, place_en, mode, mode_en, attendees, attendees_en) VALUES
(true,'2026-04-25','08:30 - 12:00','Chuyển đổi số trong quản trị doanh nghiệp bền vững','Digital transformation in sustainable corporate governance','Hội thảo','Conference','Chuyển đổi số','Digital transformation','Quy tụ các nhà lãnh đạo, chuyên gia và doanh nghiệp để thảo luận cơ hội và thách thức trong chuyển đổi số.','Leaders, experts and businesses discuss the opportunities and challenges of digital transformation.','Hà Nội','Hanoi','Trực tiếp','In person','150+ người tham dự','150+ attendees'),
(true,'2026-05-18','13:30 - 17:00','Kinh tế xanh: Cơ hội và lộ trình cho doanh nghiệp Việt Nam','Green economy: Opportunities and roadmap for Vietnamese businesses','Tọa đàm','Panel','Kinh tế xanh & ESG','Green economy & ESG','Chia sẻ kinh nghiệm, mô hình và giải pháp thực tiễn để doanh nghiệp chuyển đổi xanh.','Sharing experience, models and practical solutions for the green transition.','TP. Hồ Chí Minh','Ho Chi Minh City','Trực tiếp','In person','200+ người tham dự','200+ attendees'),
(true,'2026-06-10','09:00 - 16:00','AI trong quản trị doanh nghiệp: Từ chiến lược đến thực thi','AI in corporate management: From strategy to execution','Khóa đào tạo','Training course','Chuyển đổi số','Digital transformation','Chương trình đào tạo chuyên sâu dành cho lãnh đạo và đội ngũ quản lý doanh nghiệp.','An in-depth program for business leaders and management teams.','Trực tuyến','Online','Trực tuyến','Online','100+ người tham dự','100+ attendees'),
(false,'2026-07-15','','Quản trị nhân lực trong kỷ nguyên AI','Human resource management in the AI era','Hội thảo','Conference','Nhân lực & Tổ chức','People & Organization','','','Hà Nội','Hanoi','Trực tiếp','In person','',''),
(false,'2026-08-28','','Diễn đàn Doanh trí Việt Nam 2026','Vietnam Doanh Tri Forum 2026','Diễn đàn','Forum','Chiến lược & Lãnh đạo','Strategy & Leadership','','','TP. Hồ Chí Minh','Ho Chi Minh City','Trực tiếp','In person','',''),
(false,'2026-09-12','','Đổi mới sáng tạo trong khu vực công','Innovation in the public sector','Tọa đàm','Panel','Đổi mới sáng tạo','Innovation','','','Trực tuyến','Online','Trực tuyến','Online','','');