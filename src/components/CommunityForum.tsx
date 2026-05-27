import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  Send, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  Calendar, 
  DollarSign,
  Tag,
  Clock,
  ExternalLink,
  Image,
  X
} from 'lucide-react';
import { TripPlan } from '../types';

interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  image?: string;
}

interface ForumPost {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  upvotes: number;
  comments: Comment[];
  createdAt: string;
  tripPlan: TripPlan;
}

interface CommunityForumProps {
  currentPlan: TripPlan | null;
  onClonePlan: (plan: TripPlan) => void;
  lang: 'zh' | 'en';
  onClose: () => void;
}

export default function CommunityForum({
  currentPlan,
  onClonePlan,
  lang,
  onClose
}: CommunityForumProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create Post form states
  const [showShareForm, setShowShareForm] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareDesc, setShareDesc] = useState('');
  const [shareTags, setShareTags] = useState('');
  const [shareAuthor, setShareAuthor] = useState('');
  const [sharing, setSharing] = useState(false);

  // Comments interaction states
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [commentAuthors, setCommentAuthors] = useState<Record<string, string>>({});
  const [commentImages, setCommentImages] = useState<Record<string, string>>({});
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [clonedPostId, setClonedPostId] = useState<string | null>(null);

  // Active view details for trip plan preview inside the post
  const [previewPlanId, setPreviewPlanId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/forum/posts');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts);
        }
      }
    } catch (err) {
      console.error('Failed to fetch forum posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpvote = async (postId: string) => {
    try {
      const res = await fetch(`/api/forum/posts/${postId}/upvote`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: data.upvotes } : p));
        }
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = commentTexts[postId] || '';
    const author = commentAuthors[postId] || '';
    const image = commentImages[postId] || null;
    if (!text.trim()) return;

    try {
      const res = await fetch(`/api/forum/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text, image })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: data.comments } : p));
          setCommentTexts(prev => ({ ...prev, [postId]: '' }));
          setCommentImages(prev => ({ ...prev, [postId]: '' }));
        }
      }
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan) return;

    setSharing(true);
    try {
      const tagsArray = shareTags.split(/[,，#\s]+/).filter(Boolean);
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: shareTitle,
          description: shareDesc,
          tags: tagsArray,
          author: shareAuthor,
          tripPlan: currentPlan
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPosts(prev => [data.post, ...prev]);
          setShowShareForm(false);
          setShareTitle('');
          setShareDesc('');
          setShareTags('');
        }
      }
    } catch (err) {
      console.error('Failed to share:', err);
    } finally {
      setSharing(false);
    }
  };

  const triggerClone = (post: ForumPost) => {
    onClonePlan(post.tripPlan);
    setClonedPostId(post.id);
    setTimeout(() => setClonedPostId(null), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12 flex flex-col font-sans" id="community-forum-root">
      {/* Upper Navigation Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all cursor-pointer"
              title="返回规划器"
              id="back-to-planner-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base md:text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>{lang === 'zh' ? '旅伴广场 & 旅行路书社区' : 'Expedition Cafe & Custom Lib'}</span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-450 font-medium">
                {lang === 'zh' ? '在此处发现、分享您与 AI 探索出的极具灵动的世界路书。' : 'Browse, upvote and test custom curated route collections with 1-click clones.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentPlan && (
              <button
                onClick={() => {
                  setShareTitle(`我的完美「${currentPlan.cityPlans?.[0]?.cityName || '定制'}」游玩方案 ✨`);
                  setShowShareForm(!showShareForm);
                }}
                className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                  showShareForm 
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'
                }`}
                id="toggle-share-form-btn"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '分享当前行程' : 'Share Current Plan'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 mt-6 flex-1 flex flex-col gap-6">
        
        {/* Share Trip Form (Collapseable) */}
        {showShareForm && currentPlan && (
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20 animate-fade-in relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-6">
              <Sparkles className="w-64 h-64 text-white" />
            </div>

            <div className="z-10 relative">
              <h2 className="text-base font-bold text-indigo-300 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                {lang === 'zh' ? '将您的智能规划分享至广场' : 'Publish Your Itinerary'}
              </h2>
              <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                {lang === 'zh' 
                  ? '发布后，新奇游玩的方案将供全球驴友直接 1键克隆。对于简单填写的描述，AI 会自动为您润色包装出专业精美的小故事与高亮贴士！' 
                  : 'Let fellow travelers copy your plans with one click. AI automatically enhances empty snippets!'}
              </p>

              <form onSubmit={handleShareSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      {lang === 'zh' ? '昵称/署名 (选填)' : 'Nickname (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={shareAuthor}
                      onChange={(e) => setShareAuthor(e.target.value)}
                      placeholder={lang === 'zh' ? '新潮探索家 🗺️' : 'Vagabond Explorer'}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      {lang === 'zh' ? '主题标签 (以逗号分隔)' : 'Themes (Comma separated)'}
                    </label>
                    <input
                      type="text"
                      value={shareTags}
                      onChange={(e) => setShareTags(e.target.value)}
                      placeholder={lang === 'zh' ? '例如: 避坑首选, 极客周末, 亲子游' : 'e.g., Hidden gem, Weekend, Foodie'}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {lang === 'zh' ? '帖子标题' : 'Post Title'}
                  </label>
                  <input
                    type="text"
                    required
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder={lang === 'zh' ? '给行程起一个响亮又精美的名字' : 'A beautiful name for your trip'}
                    className="w-full bg-white/10 border border-white/12 rounded-xl px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {lang === 'zh' ? '心得、攻略与小贴士 (可空，AI 自动生成)' : 'Experience & Tips (Optional, or AI Auto Gen)'}
                  </label>
                  <textarea
                    rows={3}
                    value={shareDesc}
                    onChange={(e) => setShareDesc(e.target.value)}
                    placeholder={lang === 'zh' ? '你可以简单写一点游玩要点，AI 将自动拓展并总结出惊艳的设计提要！' : 'Write a short highlight notes, and we will do the rest.'}
                    className="w-full bg-white/10 border border-white/12 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 leading-relaxed"
                  />
                </div>

                <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-400/10 flex items-center justify-between text-[11px] text-indigo-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>
                      {lang === 'zh' 
                        ? `已绑定当前规划：「${currentPlan.title || '路书'}」含 ${currentPlan.cityPlans?.length || 0} 个城市` 
                        : `Bound plan: ${currentPlan.title}`}
                    </span>
                  </div>
                  <span className="font-mono text-indigo-450">{currentPlan.totalDays}D / {currentPlan.totalBudget}CNY</span>
                </div>

                <div className="flex justify-end gap-3.5 pt-2">
                  <button
                    type="submit"
                    disabled={sharing}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {sharing ? (
                      <>
                        <span className="animate-spin text-white">⚙️</span>
                        <span>{lang === 'zh' ? 'AI 智能润色排版中...' : 'Generating AI Enhancement...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>{lang === 'zh' ? '立即发布 (AI 智能生成)' : 'Publish via Gemini'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading feed state */}
        {loading && posts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
            <span className="animate-spin text-2xl mb-2">🏔️</span>
            <span className="text-xs font-semibold">{lang === 'zh' ? '正在加载社区精美路线...' : 'Curating community cards...'}</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-150">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-2.5" />
            <h3 className="text-sm font-bold text-slate-700">{lang === 'zh' ? '暂无分享的贴士' : 'No posts share yet'}</h3>
            <p className="text-xs text-slate-400 mt-1">{lang === 'zh' ? '快来做第一个撰写并分享行程的探索家吧！' : 'Be the first pioneer!'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const showPlanDetails = previewPlanId === post.id;
              const hasSharedPlan = !!post.tripPlan;
              const isCloned = clonedPostId === post.id;

              return (
                <div 
                  key={post.id} 
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  id={`forum-post-${post.id}`}
                >
                  <div className="p-6">
                    {/* Author & Header info */}
                    <div className="flex items-center justify-between mb-3 text-[11px] text-slate-450 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                          {post.author}
                        </span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      
                      {/* Active labels */}
                      {hasSharedPlan && (
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-[9.5px] px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                          <Check className="w-3 h-3" />
                          {lang === 'zh' ? '附带可克隆路线' : 'Clonable Plan'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug tracking-tight mb-2.5">
                      {post.title}
                    </h3>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-1.5 mb-3.5">
                        {post.tags.map((tag, idx) => (
                          <span 
                            key={`tag-${idx}`} 
                            className="bg-slate-100 hover:bg-slate-150 transition-colors text-slate-650 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI enriched recommendation narration */}
                    <p className="text-slate-600 text-xs md:text-[13px] leading-relaxed mb-4 whitespace-pre-line">
                      {post.description}
                    </p>

                    {/* Accompanying Shared Map Trip Block */}
                    {hasSharedPlan && (
                      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 mb-4 mt-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">{lang === 'zh' ? '路线城市与周期' : 'ROUTING STOPS'}</span>
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-1">
                              <span>🛫 {getCityNameList(post.tripPlan, lang)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-5">
                            <span className="text-slate-500 flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <strong>{post.tripPlan.totalDays}</strong> {lang === 'zh' ? '天' : 'Days'}
                            </span>
                            <span className="text-slate-500 flex items-center gap-1 font-mono">
                              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                              <strong>{post.tripPlan.totalBudget}</strong> {lang === 'zh' ? '元预算' : 'CNY'}
                            </span>
                          </div>
                        </div>

                        {/* Interactive toggle block */}
                        {showPlanDetails && (
                          <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-3 pl-1.5 animate-slide-up text-xs">
                            <p className="font-extrabold text-[#312e81] text-[11px] uppercase tracking-wide">
                              {lang === 'zh' ? '🗺️ 站点规划详情' : '🗺️ ROUTE SUMMARY DETAILS'}
                            </p>
                            {post.tripPlan.cityPlans.map((city, idx) => (
                              <div key={`${city.cityId}-${idx}`} className="flex flex-col gap-1 border-l-2 border-indigo-200 pl-3 py-0.5">
                                <p className="font-bold text-slate-700">
                                  {idx + 1}. {lang === 'zh' ? city.cityName : city.cityNameEn} ({city.daysCount} {lang === 'zh' ? '天' : 'Days'})
                                </p>
                                <p className="text-[10px] text-slate-500 italic">
                                  💡 {lang === 'zh' ? '本地游玩建议' : 'Tips'}: {city.veteranTips?.[0] || '精心游玩规划'}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => triggerClone(post)}
                            className={`flex-1 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              isCloned 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-slate-900 text-white hover:bg-indigo-950 active:scale-98 shadow-sm'
                            }`}
                          >
                            {isCloned ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{lang === 'zh' ? '克隆成功！已应用至左侧面板' : 'Cloned to Active Workspace!'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-300" />
                                <span>{lang === 'zh' ? '1键克隆此方案到我的规划' : 'Clone This Plan to My Editor'}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setPreviewPlanId(showPlanDetails ? null : post.id)}
                            className="bg-white hover:bg-slate-100 text-slate-650 border border-slate-200/90 text-xs font-bold py-2 px-3.5 rounded-xl cursor-pointer transition-all"
                          >
                            {showPlanDetails ? (lang === 'zh' ? '收起详情' : 'Hide Detail') : (lang === 'zh' ? '查看详情' : 'Show Detail')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upvote & Comment counts bar */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleUpvote(post.id)}
                          className="flex items-center gap-1.5 text-slate-450 hover:text-rose-500 active:scale-90 transition-all font-semibold font-mono text-xs cursor-pointer bg-slate-50 hover:bg-rose-50/50 px-3 py-1.5 rounded-full border border-transparent hover:border-rose-100"
                        >
                          <Heart className="w-4 h-4" />
                          <span>{post.upvotes || 0}</span>
                        </button>

                        <span className="flex items-center gap-1.5 text-slate-500 font-semibold font-mono text-xs bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <span>{post.comments ? post.comments.length : 0}</span>
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        #{post.id.substring(5, 9)}
                      </span>
                    </div>

                    {/* Comments Thread list */}
                    <div className="mt-4 bg-slate-50/50 border border-slate-150 rounded-2xl p-4 space-y-3.5">
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2.5 max-h-[160px] overflow-y-auto scrollbar-none pr-1">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="text-xs py-1">
                              <div className="flex items-center justify-between font-bold text-slate-700 leading-none mb-1">
                                <span>{comment.author}</span>
                                <span className="text-[9px] text-slate-400 font-normal">
                                  {new Date(comment.createdAt).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US', { hour: 'numeric', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-500 leading-relaxed pl-0.5">{comment.text}</p>
                              {comment.image && (
                                <div className="mt-1.5 pl-0.5">
                                  <img 
                                    src={comment.image} 
                                    alt="Comment attachment" 
                                    className="max-h-24 max-w-[120px] rounded-lg object-cover cursor-zoom-in hover:opacity-90 border border-slate-200 transition-all shadow-sm"
                                    referrerPolicy="no-referrer"
                                    onClick={() => setExpandedImage(comment.image || null)}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Image Preview if selected */}
                      {commentImages[post.id] && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-white border border-slate-200 rounded-xl max-w-fit relative animate-fade-in">
                          <img 
                            src={commentImages[post.id]} 
                            alt="Selected comment upload" 
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-[10px] text-slate-450 mr-4 font-medium pl-1">
                            {lang === 'zh' ? '已选取首张图片' : 'Image selected'}
                          </div>
                          <button
                            type="button"
                            onClick={() => setCommentImages(prev => ({ ...prev, [post.id]: '' }))}
                            className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all cursor-pointer shadow-sm"
                            title={lang === 'zh' ? '清除图片' : 'Clear image'}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      {/* Add comment quick input */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/50">
                        <input
                          type="text"
                          placeholder={lang === 'zh' ? '匿名旅人 🎒' : 'Anon Guest'}
                          value={commentAuthors[post.id] || ''}
                          onChange={(e) => setCommentAuthors(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] w-24 text-slate-600 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder={lang === 'zh' ? '发现行程中有亮点？写条评论吧...' : 'Add travel advice...'}
                          value={commentTexts[post.id] || ''}
                          onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommentSubmit(post.id);
                          }}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {/* Image Uploader Trigger */}
                        <label className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all cursor-pointer flex items-center justify-center">
                          <Image className="w-3.5 h-3.5" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setCommentImages(prev => ({ ...prev, [post.id]: reader.result as string }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <button
                          onClick={() => handleCommentSubmit(post.id)}
                          className="p-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Image Lightbox Preview */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in transition-all"
          onClick={() => setExpandedImage(null)}
          id="comment-image-lightbox"
        >
          <button 
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full transition-all cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <img 
            src={expandedImage} 
            alt="Expanded attachment" 
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl animate-scale-up border border-white/10"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
}

// Utility to beautifully format list of cities inside TripPlan
function getCityNameList(plan: TripPlan, lang: 'zh' | 'en'): string {
  if (!plan || !plan.cityPlans) return '未知目的地 / Mysterious Destination';
  return plan.cityPlans.map(c => lang === 'zh' ? c.cityName : c.cityNameEn).join(' → ');
}
