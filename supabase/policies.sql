-- ============================================================================
-- SUPRIYA - ROW LEVEL SECURITY (RLS) & STORAGE POLICIES
-- ============================================================================

-- Enable RLS on all sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restricted_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- HELPER FUNCTIONS FOR SECURITY CHECKS
-- ----------------------------------------------------------------------------
-- Check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE auth_user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current profile id for auth.uid()
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID AS $$
DECLARE
    p_id UUID;
BEGIN
    SELECT id INTO p_id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
    RETURN p_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ----------------------------------------------------------------------------
-- Anyone can view non-suspended profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (is_suspended = FALSE OR is_admin());

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth_user_id = auth.uid() OR is_admin());

-- Insert profile during registration
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth_user_id = auth.uid() OR auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------------------
-- 2. POSTS & POST MEDIA POLICIES
-- ----------------------------------------------------------------------------
-- Public posts are readable by all; private accounts require following
CREATE POLICY "Posts viewable according to privacy and visibility" 
ON public.posts FOR SELECT 
USING (
    visibility = 'public' 
    OR user_id = public.current_profile_id()
    OR is_admin()
    OR (
        visibility = 'followers' AND EXISTS (
            SELECT 1 FROM public.follows 
            WHERE following_id = posts.user_id AND follower_id = public.current_profile_id()
        )
    )
);

CREATE POLICY "Authors can insert posts" 
ON public.posts FOR INSERT 
WITH CHECK (user_id = public.current_profile_id());

CREATE POLICY "Authors and admins can update posts" 
ON public.posts FOR UPDATE 
USING (user_id = public.current_profile_id() OR is_admin());

CREATE POLICY "Authors and admins can delete posts" 
ON public.posts FOR DELETE 
USING (user_id = public.current_profile_id() OR is_admin());

-- Post Media
CREATE POLICY "Post media viewable with post" 
ON public.post_media FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.posts WHERE id = post_media.post_id));

CREATE POLICY "Post authors can insert media" 
ON public.post_media FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.posts 
    WHERE id = post_media.post_id AND user_id = public.current_profile_id()
));

-- ----------------------------------------------------------------------------
-- 3. LIKES & COMMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Likes are viewable by everyone" 
ON public.likes FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own likes" 
ON public.likes FOR INSERT 
WITH CHECK (user_id = public.current_profile_id());

CREATE POLICY "Users can delete their own likes" 
ON public.likes FOR DELETE 
USING (user_id = public.current_profile_id());

-- Comments
CREATE POLICY "Comments viewable by everyone" 
ON public.comments FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can create comments" 
ON public.comments FOR INSERT 
WITH CHECK (user_id = public.current_profile_id());

CREATE POLICY "Comment authors and admins can update comments" 
ON public.comments FOR UPDATE 
USING (user_id = public.current_profile_id() OR is_admin());

CREATE POLICY "Comment authors, post authors, and admins can delete comments" 
ON public.comments FOR DELETE 
USING (
    user_id = public.current_profile_id() 
    OR is_admin()
    OR EXISTS (SELECT 1 FROM public.posts WHERE id = comments.post_id AND user_id = public.current_profile_id())
);

-- ----------------------------------------------------------------------------
-- 4. STORIES POLICIES (24-hour expiration enforcement)
-- ----------------------------------------------------------------------------
CREATE POLICY "Active stories viewable by followers or public" 
ON public.stories FOR SELECT 
USING (
    expires_at > NOW() 
    AND (
        user_id = public.current_profile_id()
        OR is_admin()
        OR EXISTS (
            SELECT 1 FROM public.follows 
            WHERE following_id = stories.user_id AND follower_id = public.current_profile_id()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = stories.user_id AND is_private = FALSE
        )
    )
);

CREATE POLICY "Authors can insert stories" 
ON public.stories FOR INSERT 
WITH CHECK (user_id = public.current_profile_id());

CREATE POLICY "Authors and admins can delete stories" 
ON public.stories FOR DELETE 
USING (user_id = public.current_profile_id() OR is_admin());

-- Story Views
CREATE POLICY "Story owners can view story viewers" 
ON public.story_views FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.stories 
    WHERE id = story_views.story_id AND user_id = public.current_profile_id()
));

CREATE POLICY "Viewers can record story view" 
ON public.story_views FOR INSERT 
WITH CHECK (viewer_id = public.current_profile_id());

-- ----------------------------------------------------------------------------
-- 5. REELS (SHORT VIDEOS) POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Reels viewable by everyone" 
ON public.reels FOR SELECT USING (TRUE);

CREATE POLICY "Creators can create reels" 
ON public.reels FOR INSERT 
WITH CHECK (user_id = public.current_profile_id());

CREATE POLICY "Creators and admins can update reels" 
ON public.reels FOR UPDATE 
USING (user_id = public.current_profile_id() OR is_admin());

CREATE POLICY "Creators and admins can delete reels" 
ON public.reels FOR DELETE 
USING (user_id = public.current_profile_id() OR is_admin());

-- ----------------------------------------------------------------------------
-- 6. MESSAGING & CONVERSATIONS POLICIES (Strict Privacy)
-- ----------------------------------------------------------------------------
CREATE POLICY "Conversation members can view conversation" 
ON public.conversations FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_id = conversations.id AND user_id = public.current_profile_id()
));

CREATE POLICY "Conversation members can view member list" 
ON public.conversation_members FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.conversation_members cm 
    WHERE cm.conversation_id = conversation_members.conversation_id 
    AND cm.user_id = public.current_profile_id()
));

CREATE POLICY "Users can create conversation memberships" 
ON public.conversation_members FOR INSERT 
WITH CHECK (user_id = public.current_profile_id() OR is_admin());

CREATE POLICY "Conversation members can read messages" 
ON public.messages FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_id = messages.conversation_id AND user_id = public.current_profile_id()
));

CREATE POLICY "Conversation members can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (
    sender_id = public.current_profile_id() 
    AND EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = messages.conversation_id AND user_id = public.current_profile_id()
    )
);

CREATE POLICY "Message sender can delete own message" 
ON public.messages FOR UPDATE 
USING (sender_id = public.current_profile_id());

-- ----------------------------------------------------------------------------
-- 7. SAVED POSTS & COLLECTIONS
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can manage own collections" 
ON public.collections FOR ALL 
USING (user_id = public.current_profile_id());

CREATE POLICY "Users can manage own saved posts" 
ON public.saved_posts FOR ALL 
USING (user_id = public.current_profile_id());

-- ----------------------------------------------------------------------------
-- 8. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can only see their own notifications" 
ON public.notifications FOR SELECT 
USING (recipient_id = public.current_profile_id());

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (recipient_id = public.current_profile_id());

-- ----------------------------------------------------------------------------
-- 9. REPORTS & MODERATION
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can create reports" 
ON public.reports FOR INSERT 
WITH CHECK (reporter_id = public.current_profile_id());

CREATE POLICY "Only admins can view and resolve reports" 
ON public.reports FOR ALL 
USING (public.is_admin());

CREATE POLICY "Only admins can view and create moderation actions" 
ON public.moderation_actions FOR ALL 
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 10. SUPABASE STORAGE BUCKET POLICIES
-- ----------------------------------------------------------------------------
-- Buckets: avatars, posts, stories, reels, messages
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('avatars', 'avatars', true),
    ('posts', 'posts', true),
    ('stories', 'stories', true),
    ('reels', 'reels', true),
    ('messages', 'messages', false)
ON CONFLICT (id) DO NOTHING;

-- Public read for avatars, posts, stories, reels
CREATE POLICY "Public read for avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Public read for posts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'posts');

CREATE POLICY "Public read for stories" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'stories');

CREATE POLICY "Public read for reels" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'reels');

-- Authenticated user uploads
CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload posts media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload stories media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'stories' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload reels" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'reels' AND auth.role() = 'authenticated');
